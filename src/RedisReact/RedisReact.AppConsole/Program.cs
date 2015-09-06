using ServiceStack;
using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RedisReact.AppConsole
{
    static class Program
    {
        public static string HostUrl = "http://localhost:2337/";

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
