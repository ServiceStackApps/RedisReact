using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RedisReact.Resources;
using RedisReact.ServiceInterface;
using Funq;
using ServiceStack;
using ServiceStack.Razor;
using ServiceStack.Redis;
using ServiceStack.Text;

namespace RedisReact.AppWinForms
{
    public class AppHost : AppSelfHostBase
    {
        /// <summary>
        /// Default constructor.
        /// Base constructor requires a name and assembly to locate web service classes. 
        /// </summary>
        public AppHost()
            : base("RedisReact.AppWinForms", typeof(RedisServices).Assembly)
        {

        }

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            JsConfig.EmitCamelCaseNames = true;

            container.Register<IRedisClientsManager>(c =>
                new RedisManagerPool("127.0.0.1"));

            SetConfig(new HostConfig
            {
                DebugMode = AppSettings.Get("DebugMode", false),
                DefaultContentType = MimeTypes.Json,
                AllowFileExtensions = { "jsx" },
                AddRedirectParamsToQueryString = true
            });

            /* Default */

            Plugins.Add(new RazorFormat
            {
                LoadFromAssemblies = { typeof(CefResources).Assembly },
            });

            SetConfig(new HostConfig
            {
                DebugMode = true,
                EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(CefResources) },
            });
        }
    }
}
