using System.Collections.Generic;
using System.Linq;
using ServiceStack;
using RedisReact.ServiceModel;
using ServiceStack.Redis;

namespace RedisReact.ServiceInterface
{
    public class RedisServices : Service
    {
        public object Any(SearchRedis request)
        {
            var limit = request.Take.GetValueOrDefault(100);

            var keys = Redis.ScanAllKeys(pattern: request.Query, pageSize: limit)
                .Take(limit).ToList();

            var keyTypes = new Dictionary<string, string>();
            var keyTtls = new Dictionary<string, long>();
            var keySizes = new Dictionary<string, long>();

            if (keys.Count > 0)
            {
                using (var pipeline = Redis.CreatePipeline())
                {
                    keys.Each(key =>
                        pipeline.QueueCommand(r => ((RedisNativeClient)r).Type(key), x => keyTypes[key] = x));

                    keys.Each(key =>
                        pipeline.QueueCommand(r => ((RedisNativeClient)r).PTtl(key), x => keyTtls[key] = x));

                    pipeline.Flush();
                }

                using (var pipeline = Redis.CreatePipeline())
                {
                    foreach (var entry in keyTypes)
                    {
                        var key = entry.Key;
                        switch (entry.Value)
                        {
                            case "string":
                                pipeline.QueueCommand(r => ((RedisNativeClient)r).StrLen(key), x => keySizes[key] = x);
                                break;
                            case "list":
                                pipeline.QueueCommand(r => r.GetListCount(key), x => keySizes[key] = x);
                                break;
                            case "set":
                                pipeline.QueueCommand(r => r.GetSetCount(key), x => keySizes[key] = x);
                                break;
                            case "zset":
                                pipeline.QueueCommand(r => r.GetSortedSetCount(key), x => keySizes[key] = x);
                                break;
                            case "hash":
                                pipeline.QueueCommand(r => r.GetHashCount(key), x => keySizes[key] = x);
                                break;
                        }
                    }

                    pipeline.Flush();
                }
            }

            return new SearchRedisResponse
            {
                Results = keys.Map(x => new SearchResult
                {
                    Id = x,
                    Type = keyTypes.GetValueOrDefault(x),
                    Ttl = keyTtls.GetValueOrDefault(x),
                    Size = keySizes.GetValueOrDefault(x),
                })
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

            var testConnection = new RedisClient(connString);
            testConnection.Ping();

            ((IRedisFailover)RedisManager).FailoverTo(connString);

            return Get(new GetConnection());
        }

        public object Any(FallbackForClientRoutes request)
        {
            //Return default.cshtml for unmatched requests so routing is handled on the client
            return new HttpResult
            {
                View = "/default.cshtml"
            };
        }
    }

    [FallbackRoute("/{PathInfo*}")]
    public class FallbackForClientRoutes
    {
        public string PathInfo { get; set; }
    }
}