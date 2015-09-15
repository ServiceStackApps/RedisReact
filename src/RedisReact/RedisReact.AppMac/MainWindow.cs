
using System;
using System.Collections.Generic;
using System.Linq;
using MonoMac.Foundation;
using MonoMac.AppKit;

namespace RedisReact.AppMac
{
	public partial class MainWindow : MonoMac.AppKit.NSWindow
	{
		#region Constructors

		// Called when created from unmanaged code
		public MainWindow (IntPtr handle) : base (handle)
		{
			Initialize ();
		}
		
		// Called when created directly from a XIB file
		[Export ("initWithCoder:")]
		public MainWindow (NSCoder coder) : base (coder)
		{
			Initialize ();
		}
		
		// Shared initialization code
		void Initialize ()
		{
		}

		#endregion

		public override void AwakeFromNib()
		{
			base.AwakeFromNib ();
			MainClass.MainMenu = NSApplication.SharedApplication.MainMenu;
			webView.MainFrameUrl = MainClass.HostUrl;
			webView.Frame = new System.Drawing.RectangleF(0,0,this.Frame.Width,this.Frame.Height);
			this.DidResize += (sender, e) =>  {
				webView.Frame = new System.Drawing.RectangleF(0,0,this.Frame.Width,this.Frame.Height);
			};
		}
	}
}

