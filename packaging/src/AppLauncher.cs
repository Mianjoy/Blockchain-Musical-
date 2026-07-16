using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("Blockchain MUSIC")]
[assembly: AssemblyProduct("Blockchain MUSIC")]
[assembly: AssemblyDescription("Launcher for launchers\\APP-UP.bat")]
[assembly: AssemblyCompany("Blockchain Musical")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace BlockchainMusic.Launchers
{
    internal static class AppLauncher
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string exeDir = AppDomain.CurrentDomain.BaseDirectory;
            string root = exeDir.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            string leaf = Path.GetFileName(root);
            if (string.Equals(leaf, "dist", StringComparison.OrdinalIgnoreCase)
                || string.Equals(leaf, "launchers", StringComparison.OrdinalIgnoreCase)
                || string.Equals(leaf, "packaging", StringComparison.OrdinalIgnoreCase))
            {
                root = Path.GetDirectoryName(root) ?? root;
            }

            string bat = Path.Combine(root, "launchers", "APP-UP.bat");
            if (!File.Exists(bat))
            {
                // compat: bat antiguo en la raiz
                bat = Path.Combine(root, "APP-UP.bat");
            }
            if (!File.Exists(bat))
            {
                MessageBox.Show(
                    "No se encontro APP-UP.bat en:\n" +
                    Path.Combine(root, "launchers") +
                    "\n\nColoca este ejecutable en la raiz del repositorio Blockchain-Musical-.",
                    "Blockchain MUSIC",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
                return;
            }

            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = bat,
                    WorkingDirectory = root,
                    UseShellExecute = true
                };
                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "No se pudo iniciar APP-UP.bat:\n" + ex.Message,
                    "Blockchain MUSIC",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }
        }
    }
}
