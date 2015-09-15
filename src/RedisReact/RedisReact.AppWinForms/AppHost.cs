using Funq;
using ServiceStack;
using ServiceStack.Razor;
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
            : base("RedisReact.AppWinForms", typeof(RedisServices).Assembly) {}

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            SharedUtils.Configure(this);

            Plugins.Add(new RazorFormat {
                LoadFromAssemblies = { typeof(CefResources).Assembly },
            });

            SetConfig(new HostConfig {
                DebugMode = true,
                EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(CefResources) },
            });
        }
    }
}
