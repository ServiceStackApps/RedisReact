using System;
using ServiceStack;
using Funq;
using ServiceStack.Razor;
using System.Reflection;
using ServiceStack.Text;
using System.Net;
using ServiceStack.Auth;
using ServiceStack.Redis;
using MonoMac.AppKit;
using System.Linq;
using RedisReact.ServiceInterface;
using RedisReact.Resources;

namespace RedisReact.AppMac
{
	public class AppHost : AppSelfHostBase
	{
		/// <summary>
		/// Default constructor.
		/// Base constructor requires a name and assembly to locate web service classes. 
		/// </summary>
		public AppHost()
			: base("RedisReact.AppMac", typeof(MyServices).Assembly)
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
					EmbeddedResourceBaseTypes = { typeof(AppHost), typeof(CefResources) }
				});

			Routes.Add<NativeHostAction>("/nativehost/{Action}");
			ServiceController.RegisterService(typeof(NativeHostService));

			var allKeys = AppSettings.GetAllKeys();
			if (!allKeys.Contains("platformsClassName"))
				AppSettings.Set("platformsClassName", "mac");
			if (!allKeys.Contains("PlatformCss"))
				AppSettings.Set("PlatformCss", "mac.css");
			if (!allKeys.Contains("PlatformJs"))
				AppSettings.Set("PlatformJs", "mac.js");
		}
	}

	public class NativeHostService : Service
	{
		public object Get(NativeHostAction request)
		{
			if (string.IsNullOrEmpty(request.Action)) {
				throw HttpError.NotFound ("Function Not Found");
			}
			Type nativeHostType = typeof(NativeHost);
			object nativeHost = nativeHostType.CreateInstance<NativeHost>();
			string methodName = request.Action.First ().ToString ().ToUpper () + String.Join ("", request.Action.Skip (1));
			MethodInfo methodInfo = nativeHostType.GetMethod(methodName);
			if (methodInfo == null)
			{
				throw new HttpError(HttpStatusCode.NotFound,"Function Not Found");
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
		public void ShowAbout()
		{
			//Invoke native about menu item programmatically.
			MainClass.MainMenu.InvokeOnMainThread (() => {
				foreach (var item in MainClass.MainMenu.ItemArray()) {
					if (item.Title == "RedisReact") {
						item.Submenu.PerformActionForItem(0);
					}
				}
			});
		}

		public void Quit()
		{
			Environment.Exit(0);
		}
	}
}

