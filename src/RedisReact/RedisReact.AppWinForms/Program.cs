using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using CefSharp;
using ServiceStack;
using ServiceStack.Text;

namespace RedisReact.AppWinForms
{
    static class Program
    {
        public static string HostUrl = "http://localhost:1337/";
        public static AppHost AppHost;
        public static FormMain Form;

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Cef.Initialize(new CefSettings());

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            AppHost = new AppHost();
            AppHost.Init().Start("http://*:1337/");
            "ServiceStack SelfHost listening at {0} ".Fmt(HostUrl).Print();
            Form = new FormMain();
            Application.Run(Form);
        }
    }
}
