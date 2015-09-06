using System;
using System.Collections.Generic;
using System.Linq;
using ServiceStack;
using RedisReact.ServiceModel;
using ServiceStack.Redis;
using ServiceStack.Text;

namespace RedisReact.ServiceInterface
{
    public class RedisServices : Service
    {
        public object Any(SearchRedis request)
        {
            try
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
            catch (Exception ex)
            {
                ex.Message.Print();
                throw;
            }
        }

        public object Any(CallRedis request)
        {
            var args = request.Args.ToArray();
            var response = request.AsBytes
                ? new CallRedisResponse { RedisData = ((IRedisNativeClient)Redis).RawCommand(args) }
                : new CallRedisResponse { RedisText = Redis.Custom(args) };

            return response;
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