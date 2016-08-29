using System.Collections.Generic;
using ServiceStack;
using RedisReact.ServiceModel;
using ServiceStack.Configuration;
using ServiceStack.Redis;

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

        public object Get(GetConnection request)
        {
            return new GetConnectionResponse
            {
                Host = Redis.Host,
                Port = Redis.Port,
                Db = (int)Redis.Db,
            };
        }

        public object Post(ChangeConnection request)
        {
            var connString = "{0}:{1}?db={2}".Fmt(
                request.Host ?? "127.0.0.1",
                request.Port.GetValueOrDefault(6379),
                request.Db.GetValueOrDefault(0));

            if (!string.IsNullOrEmpty(request.Password))
                connString += "&password=" + request.Password.UrlEncode();

            var testConnection = new RedisClient(connString);
            testConnection.Ping();

            ((IRedisFailover)TryResolve<IRedisClientsManager>()).FailoverTo(connString);

            return Get(new GetConnection());
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