using System;
using System.Drawing;
using MonoMac.Foundation;
using MonoMac.AppKit;
using MonoMac.ObjCRuntime;

namespace RedisReact.AppMac
{
	public partial class AppDelegate : NSApplicationDelegate
	{
		MainWindowController mainWindowController;

		public AppDelegate ()
		{
		}

		public override void FinishedLaunching (NSObject notification)
		{
			
#if DEBUG
			//Enable WebInspector in WebView
			var defaults = NSUserDefaults.StandardUserDefaults;
			defaults.SetBool (true, "WebKitDeveloperExtras");
			defaults.Synchronize();
#endif

			mainWindowController = new MainWindowController ();
			mainWindowController.Window.MakeKeyAndOrderFront (this);
		}
	}
}

