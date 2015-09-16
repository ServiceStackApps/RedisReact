using System.IO;
using ServiceStack;
using ServiceStack.Configuration;
using ServiceStack.Redis;
using ServiceStack.Text;

namespace RedisReact.ServiceInterface
{
    public class SharedUtils
    {
        public static IAppSettings GetAppSettings()
        {
            var paths = new[]
            {
                "~/appsettings.txt".MapHostAbsolutePath(),
                "~/appsettings.txt".MapAbsolutePath(),
            };

            foreach (var path in paths)
            {
                var customSettings = new FileInfo(path);
                if (customSettings.Exists)
                    return new TextFileSettings(customSettings.FullName);
            }

            return new AppSettings();
        }

        public static void Configure(IAppHost appHost)
        {
            JsConfig.EmitCamelCaseNames = true;

            var container = appHost.GetContainer();
            container.Register<IRedisClientsManager>(c =>
                new RedisManagerPool(appHost.AppSettings.Get("redis-server", "127.0.0.1")));
        }
    }
}
