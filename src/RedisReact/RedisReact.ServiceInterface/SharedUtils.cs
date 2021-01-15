using System;
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
            CreateAppSettingsIfNotExists(
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".redisreact"));

            var paths = new[]
            {
                "~/appsettings.txt".MapHostAbsolutePath(),
                "~/appsettings.txt".MapAbsolutePath(),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".redisreact", "appsettings.txt")
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
            appHost.Config.UseCamelCase = true;

            RedisConfig.AssumeServerVersion = 2821;

            var container = appHost.GetContainer();
            container.Register<IRedisClientsManager>(c =>
                new RedisManagerPool(appHost.AppSettings.Get("redis-server", "127.0.0.1")));
        }

        public static void CreateAppSettingsIfNotExists(string redisreactDir)
        {
            if (!Directory.Exists(redisreactDir))
            {
                try
                {
                    Directory.CreateDirectory(redisreactDir);
                    var appSettingsPath = Path.Combine(redisreactDir, "appsettings.txt");
                    File.WriteAllText(appSettingsPath, "redis-server 127.0.0.1?db=0\r\nquery-limit 100");
                }
                catch { }
            }
        }
    }
}
