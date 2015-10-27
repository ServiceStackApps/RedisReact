using System;
using System.Drawing;
using ServiceStack.Text;
using MonoMac.Foundation;
using MonoMac.AppKit;
using MonoMac.ObjCRuntime;

namespace RedisReact.AppMac
{
	public static class Program
	{
		public static string HostUrl = "http://localhost:3337/";
		public static string ListenOn = "http://*:3337/";

		public static AppHost App;
		public static NSMenu MainMenu;

		static void Main (string[] args)
		{
			try 
			{
				App = new AppHost();
				App.Init().Start(ListenOn);
			} 
			catch (Exception) 
			{
				"Using existing AppHost found on {0}".Print(HostUrl);
			}

			NSApplication.Init();
			NSApplication.Main(args);
		}
	}
}

