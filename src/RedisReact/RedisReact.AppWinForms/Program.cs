﻿using System;
using System.IO;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using RedisReact.ServiceInterface;
using ServiceStack;
using ServiceStack.Text;

namespace RedisReact.AppWinForms
{
    static class Program
    {
        public static string HostUrl = "http://127.0.0.1:2337/";
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
            AppHost.Init().Start("http://*:2337/");
            "ServiceStack SelfHost listening at {0} ".Fmt(HostUrl).Print();
            Form = new FormMain();
            Application.Run(Form);
        }
    }
}
