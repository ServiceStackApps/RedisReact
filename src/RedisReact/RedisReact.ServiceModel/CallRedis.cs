using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ServiceStack;
using ServiceStack.Redis;

namespace RedisReact.ServiceModel
{
    [Route("/connection", "GET")]
    public class GetConnection : IReturn<GetConnectionResponse> { }

    public class GetConnectionResponse
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public int Db { get; set; }

        public ResponseStatus ResponseStatus { get; set; }
    }

    [Route("/connection", "POST")]
    public class ChangeConnection : IReturn<GetConnectionResponse>
    {
        public string Host { get; set; }
        public int? Port { get; set; }
        public int? Db { get; set; }
    }

    [Route("/call-redis")]
    public class CallRedis : IReturn<CallRedisResponse>
    {
        public bool AsBytes { get; set; }
        public List<string> Args { get; set; }
    }

    public class CallRedisResponse
    {
        public RedisData RedisData { get; set; }
        public RedisText RedisText { get; set; }

        public ResponseStatus ResponseStatus { get; set; }
    }

    [Route("/search-redis")]
    public class SearchRedis : IReturn<SearchRedisResponse>
    {
        public string Query { get; set; }
        public int? Take { get; set; }
    }

    public class SearchResult
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public long Ttl { get; set; }
        public long Size { get; set; }
    }

    public class SearchRedisResponse
    {
        public List<SearchResult> Results { get; set; }

        public ResponseStatus ResponseStatus { get; set; }
    }
}