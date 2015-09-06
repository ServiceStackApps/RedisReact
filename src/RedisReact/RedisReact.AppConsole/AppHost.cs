using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using Funq;
using RedisReact.Resources;
using RedisReact.ServiceInterface;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Configuration;
using ServiceStack.Razor;
using ServiceStack.Redis;
using ServiceStack.Text;


namespace RedisReact.AppConsole
{
    public class AppHost : AppSelfHostBase
    {
        /// <summary>
        /// Default constructor.
        /// Base constructor requires a name and assembly to locate web service classes. 
        /// </summary>
        public AppHost()
            : base("RedisReact.AppConsole", typeof(RedisServices).Assembly)
        {

        }

        /// <summary>
        /// Application specific configuration
        /// This method should initialize any IoC resources utilized by your web service classes.
        /// </summary>
        /// <param name="container"></param>
        public override void Configure(Container container)
        {
            //Config examples
            //this.Plugins.Add(new PostmanFeature());
            //Plugins.Add(new CorsFeature());

            Plugins.Add(new RazorFormat
            {
                LoadFromAssemblies = { typeof(CefResources).Assembly },
            });

            SetConfig(new HostConfig
            {
                DebugMode = true,
                EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(CefResources) },
            });

            var allKeys = AppSettings.GetAllKeys();

            if (!allKeys.Contains("platformsClassName"))
                AppSettings.Set("platformsClassName", "console");
            if (!allKeys.Contains("PlatformCss"))
                AppSettings.Set("PlatformCss", "console.css");
            if (!allKeys.Contains("PlatformJs"))
                AppSettings.Set("PlatformJs", "console.js");

            // This route is added using Routes.Add and ServiceController.RegisterService due to
            // using ILMerge limiting our AppHost : base() call to one assembly.
            // If two assemblies are used, the base() call searchs the same assembly twice due to the ILMerged result.
            Routes.Add<NativeHostAction>("/nativehost/{Action}");
            ServiceController.RegisterService(typeof(NativeHostService));
        }
    }

    public class NativeHostService : Service
    {
        public object Get(NativeHostAction request)
        {
            if (string.IsNullOrEmpty(request.Action))
            {
                throw HttpError.NotFound("Function Not Found");
            }
            Type nativeHostType = typeof(NativeHost);
            object nativeHost = nativeHostType.CreateInstance<NativeHost>();
            //Upper case first character.
            string methodName = request.Action.First().ToString().ToUpper() + String.Join("", request.Action.Skip(1));
            MethodInfo methodInfo = nativeHostType.GetMethod(methodName);
            if (methodInfo == null)
            {
                throw new HttpError(HttpStatusCode.NotFound, "Function Not Found");
            }
            methodInfo.Invoke(nativeHost, null);
            return null;
        }
    }

    public class NativeHostAction : IReturnVoid
    {
        public string Action { get; set; }
    }

    public class NativeHost
    {
        public void Quit()
        {
            Environment.Exit(0);
        }
    }
}
