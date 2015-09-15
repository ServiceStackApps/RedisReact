using ServiceStack;
using ServiceStack.Redis;
using ServiceStack.Text;

namespace RedisReact.ServiceInterface
{
    public class SharedUtils
    {
        public static void Configure(IAppHost appHost)
        {
            JsConfig.EmitCamelCaseNames = true;

            var container = appHost.GetContainer();
            container.Register<IRedisClientsManager>(c =>
                new RedisManagerPool("127.0.0.1"));
        }
    }
}
