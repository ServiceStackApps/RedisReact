using RedisReact.ServiceModel;
using ServiceStack;
using ServiceStack.Redis;

namespace RedisReact.ServiceInterface
{
    public static class Extensions
    {
        public static string GetKey(this ConnectionRequest request)
        {
            return "redis-connection-{0}:{1}".Fmt(request.Host, request.Port);
        }

        public static ConnectionRequest WithDefaults(this ConnectionRequest request)
        {
            return new ConnectionRequest {
                Host = request.Host ?? "127.0.0.1",
                Port = request.Port.GetValueOrDefault(6379),
                Db = request.Db.GetValueOrDefault(0),
                IsActive = request.IsActive,
                Password = request.Password
            };
        }

        public static string ToConnectionString(this ConnectionRequest request)
        {
            var connString = "{0}:{1}?db={2}".Fmt(
                request.Host,
                request.Port,
                request.Db);

            if (!string.IsNullOrEmpty(request.Password))
                connString += "&password=" + request.Password.UrlEncode();

            return connString;
        }

        public static bool IsEquvalentTo(this IRedisClient redis, ConnectionRequest request)
        {
            return request.Host == redis.Host && request.Port == redis.Port;
        }

    }
}