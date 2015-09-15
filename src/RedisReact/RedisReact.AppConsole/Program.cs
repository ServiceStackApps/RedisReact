using ServiceStack;
using ServiceStack.Text;
using System;
using System.Diagnostics;
using System.Threading;

namespace RedisReact.AppConsole
{
    static class Program
    {
        public static string HostUrl = "http://127.0.0.1:2337/";

        /// <summary>
        /// The main entry point for the application
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            new AppHost().Init().Start("http://*:2337/");
            "ServiceStack SelfHost listening at {0}".Fmt(HostUrl).Print();
            Process.Start(HostUrl);

            Thread.Sleep(Timeout.Infinite);
        }
    }
}
