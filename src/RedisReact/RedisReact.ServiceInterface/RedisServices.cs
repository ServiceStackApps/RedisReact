using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using ServiceStack;
using RedisReact.ServiceModel;
using ServiceStack.Configuration;
using ServiceStack.Redis;
using ServiceStack.Text.Json;

namespace RedisReact.ServiceInterface
{
    public class RedisServices : Service
    {
        public IAppSettings AppSettings { get; set; }

        public object Any(SearchRedis request)
        {
            var limit = request.Take.GetValueOrDefault(AppSettings.Get("query-limit", 100));

            const string LuaScript = @"
local limit = tonumber(ARGV[2])
local pattern = ARGV[1]
local cursor = 0
local len = 0
local keys = {}

repeat
    local r = redis.call('scan', cursor, 'MATCH', pattern, 'COUNT', limit)
    cursor = tonumber(r[1])
    for k,v in ipairs(r[2]) do
        table.insert(keys, v)
        len = len + 1
        if len == limit then break end
    end
until cursor == 0 or len == limit

if len == 0 then
    return '[]'
end

local keyAttrs = {}
for i,key in ipairs(keys) do
    local type = redis.call('type', key)['ok']
    local pttl = redis.call('pttl', key)
    local size = 0
    if type == 'string' then
        size = redis.call('strlen', key)
    elseif type == 'list' then
        size = redis.call('llen', key)
    elseif type == 'set' then
        size = redis.call('scard', key)
    elseif type == 'zset' then
        size = redis.call('zcard', key)
    elseif type == 'hash' then
        size = redis.call('hlen', key)
    end

    local attrs = {['id'] = key, ['type'] = type, ['ttl'] = pttl, ['size'] = size}

    table.insert(keyAttrs, attrs)    
end

return cjson.encode(keyAttrs)";

            var json = Redis.ExecCachedLua(LuaScript, sha1 =>
                Redis.ExecLuaShaAsString(sha1, request.Query, limit.ToString()));

            var searchResults = json.FromJson<List<SearchResult>>();

            return new SearchRedisResponse
            {
                Results = searchResults
            };
        }

        public object Any(CallRedis request)
        {
            var args = request.Args.ToArray();
            var response = new CallRedisResponse { Result = Redis.Custom(args) };
            return response;
        }

        public object Get(GetConnections request)
        {
            var connections = new List<Connection> {
                new Connection {
                    Host = Redis.Host,
                    Port = Redis.Port,
                    Db = (int)Redis.Db,
                    IsActive = true,
                    IsMaster = Redis.GetServerRole() == RedisServerRole.Master
                }
            };
            string master = null;
            if (Redis.Info.ContainsKey("slaveof")) {
                master = Redis.Info["slaveof"];
            }

            var settings = SharedUtils.GetAppSettings();
            foreach (var key in settings.GetAllKeys().Where(k => k.StartsWith("redis-connection"))) {
                try {
                    var connection = settings.Get<ConnectionRequest>(key, null);
                    if (connection == null || Redis.IsEquvalentTo(connection))
                        continue;

                    var response = new Connection {
                        Host = connection.Host,
                        Port = connection.Port.GetValueOrDefault(),
                        Db = connection.Db.GetValueOrDefault()
                    };
                    if (master != null && "{0} {1}".Fmt(connection.Host, connection.Port) == master) {
                        response.IsMaster = true;
                    }
                    connections.Add(response);
                } catch {
                    // ignore
                }
            }

            return new GetConnectionsResponse {
                Connections = connections
            };
        }

        public object Post(ConnectionRequest request)
        {
            var connection = request.WithDefaults();
            var settings = SharedUtils.GetAppSettings();
            var key = connection.GetKey();

            // copy password over from existing if it exists (and the inbound connection doesn't have one)
            if (string.IsNullOrEmpty(request.Password) && settings.Exists(key)) {
                var existing = settings.Get<ConnectionRequest>(key, null);
                if (existing != null) {
                    connection.Password = existing.Password;
                }
            }

            settings.Set(key, connection);

            var connString = connection.ToConnectionString();
            try {
                var testConnection = new RedisClient(connString);
                testConnection.Ping();
            } catch {
                connString += "&ssl=true";
                var testConnection = new RedisClient(connString);
                testConnection.Ping();
            }

            var current = SharedUtils.SetRedisServer(settings, connString);
            ((IRedisFailover)TryResolve<IRedisClientsManager>()).FailoverTo(new [] { connString, current }, new [] { connString });
            SharedUtils.WriteAppSettingsToDisk(settings);

            return Get(new GetConnections());
        }

        public object Delete(DeleteConnection request)
        {
            var connection = new ConnectionRequest { Host = request.Host, Port = request.Port }.WithDefaults();
            if (Redis.IsEquvalentTo(connection)) throw new InvalidOperationException("Cannot delete the active connection");

            var settings = SharedUtils.GetAppSettings();
            var key = connection.GetKey();
            if (settings.Exists(key)) {
                settings.Set(key, (ConnectionRequest)null);
                SharedUtils.WriteAppSettingsToDisk(settings);
            }
            return Get(new GetConnections());
        }

        public object Any(GetRedisClientStats request)
        {
            return new GetRedisClientStatsResponse { Result = RedisStats.ToDictionary() };
        }

        private static string defaultHtml = null;

        public object Any(FallbackForClientRoutes request)
        {
            return defaultHtml ?? 
                (defaultHtml = HostContext.ResolveVirtualFile("/default.html", Request).ReadAllText());
        }
    }

    [FallbackRoute("/{PathInfo*}")]
    public class FallbackForClientRoutes
    {
        public string PathInfo { get; set; }
    }
}