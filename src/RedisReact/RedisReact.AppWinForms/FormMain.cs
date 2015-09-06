using System;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using CefSharp.WinForms.Internals;

namespace RedisReact.AppWinForms
{
    public partial class FormMain : Form
    {
        public ChromiumWebBrowser ChromiumBrowser { get; private set; }
        public FormMain()
        {
            InitializeComponent();
            VerticalScroll.Visible = false;

            ChromiumBrowser = new ChromiumWebBrowser(Program.HostUrl)
            {
                Dock = DockStyle.Fill
            };

            Controls.Add(ChromiumBrowser);

            FormClosed += (sender, args) =>
            {
                Cef.Shutdown();
            };

            Load += (sender, args) =>
            {
                FormBorderStyle = FormBorderStyle.None;
                Left = Top = 0;
                Width = Screen.PrimaryScreen.WorkingArea.Width;
                Height = Screen.PrimaryScreen.WorkingArea.Height;
            };

            ChromiumBrowser.RegisterJsObject("nativeHost", new NativeHost(this));
        }
    }
}
