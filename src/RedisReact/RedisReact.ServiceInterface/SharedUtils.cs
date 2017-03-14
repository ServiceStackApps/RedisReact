using System;
using System.IO;
using System.Linq;
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
            JsConfig.EmitCamelCaseNames = true;

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
                    var settings = new AppSettings();
                    SetRedisServer(settings, "127.0.0.1?db=0");
                    settings.Set("query-limit", "100");
                    WriteAppSettingsToDisk(settings, Path.Combine(redisreactDir, "appsettings.txt"));
                }
                catch { }
            }
        }

        public static string SetRedisServer(IAppSettings settings, string connectionString)
        {
            const string key = "redis-server";
            string existing = null;
            if (settings.Exists(key)) {
                existing = settings.GetString(key);
            }
            settings.Set(key, connectionString);
            return existing;
        }

        public static void WriteAppSettingsToDisk(IAppSettings settings, string path = null)
        {
            try {
                if (path == null) {
                    path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".redisreact", "appsettings.txt");
                }
                File.WriteAllLines(path, settings.GetAll().Select(pair => "{0} {1}".Fmt(pair.Key, pair.Value)));
            } catch {
                // ignore
            }
        }
    }
}
