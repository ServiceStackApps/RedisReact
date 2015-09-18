using Funq;
using ServiceStack;
using RedisReact.Resources;
using RedisReact.ServiceInterface;

namespace RedisReact.AppWinForms
{
    public class AppHost : AppSelfHostBase
    {
        /// <summary>
        /// Default constructor.
        /// Base constructor requires a name and assembly to locate web service classes. 
        /// </summary>
        public AppHost()
            : base("RedisReact.AppWinForms", typeof (RedisServices).Assembly)
        {
            AppSettings = SharedUtils.GetAppSettings();
        }

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            SharedUtils.Configure(this);

            SetConfig(new HostConfig {
                DebugMode = AppSettings.Get("DebugMode", false),
                EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(CefResources) },
            });
        }
    }
}
