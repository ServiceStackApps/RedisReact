using System.Windows.Forms;
using System.Windows.Forms.VisualStyles;
using CefSharp.WinForms.Internals;
using CefSharp;

namespace RedisReact.AppWinForms
{
    public class NativeHost
    {
        private readonly FormMain formMain;

        public NativeHost(FormMain formMain)
        {
            this.formMain = formMain;
        }

        public void Quit()
        {
            formMain.InvokeOnUiThreadIfRequired(() =>
            {
                formMain.Close();
            });
        }

        public void ShowAbout()
        {
            MessageBox.Show(@"ServiceStack with CefSharp + ReactJS", @"RedisReact.AppWinForms", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        public void ToggleFormBorder()
        {
            formMain.InvokeOnUiThreadIfRequired(() =>
            {
                formMain.FormBorderStyle = formMain.FormBorderStyle == FormBorderStyle.None
                    ? FormBorderStyle.Sizable
                    : FormBorderStyle.None;
            });
        }

        public void Ready()
        {
            formMain.InvokeOnUiThreadIfRequired(() =>
            {
#if DEBUG
                formMain.ChromiumBrowser.KeyboardHandler = new KeyboardHandler();
#endif
            });
        }
    }

#if DEBUG
    public class KeyboardHandler : IKeyboardHandler
    {
        public bool OnPreKeyEvent(IWebBrowser browserControl, KeyType type, int windowsKeyCode, int nativeKeyCode,
            CefEventFlags modifiers, bool isSystemKey, ref bool isKeyboardShortcut)
        {
            if (windowsKeyCode == (int)Keys.F12)
            {
                Program.Form.ChromiumBrowser.ShowDevTools();
            }
            return false;
        }

        public bool OnKeyEvent(IWebBrowser browserControl, KeyType type, int windowsKeyCode, CefEventFlags modifiers, bool isSystemKey)
        {
            return false;
        }
    }
#endif
}
