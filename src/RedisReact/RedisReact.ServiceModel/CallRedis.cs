using System.Collections.Generic;
using ServiceStack;
using ServiceStack.Redis;

namespace RedisReact.ServiceModel
{
    [Route("/connections", "GET")]
    public class GetConnections : IReturn<GetConnectionsResponse> { }

    public class GetConnectionsResponse
    {
        public List<Connection> Connections { get; set; }

        public ResponseStatus ResponseStatus { get; set; }
    }

    public class Connection
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public int Db { get; set; }

        public bool IsActive { get; set; }
        public bool? IsMaster { get; set; }
    }

    [Route("/connections", "POST")]
    public class ConnectionRequest : IReturn<GetConnectionsResponse>
    {
        public string Host { get; set; }
        public int? Port { get; set; }
        public int? Db { get; set; }

        public string Password { get; set; }
        public bool? IsActive { get; set; }
    }

    [Route("/connections/{host}", "DELETE")]
    public class DeleteConnection : IReturn<GetConnectionsResponse>
    {
        public string Host { get; set; }
        public int? Port { get; set; }
    }

    [Route("/call-redis")]
    public class CallRedis : IReturn<CallRedisResponse>
    {
        public List<string> Args { get; set; }
    }

    public class CallRedisResponse
    {
        public RedisText Result { get; set; }

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

    [Route("/redisclient/stats")]
    public class GetRedisClientStats : IReturn<GetRedisClientStatsResponse> { }

    public class GetRedisClientStatsResponse
    {
        public Dictionary<string, long> Result { get; set; }
    }
}