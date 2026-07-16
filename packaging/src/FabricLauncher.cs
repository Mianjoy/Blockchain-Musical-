using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("Blockchain MUSIC - Fabric")]
[assembly: AssemblyProduct("Blockchain MUSIC - Fabric")]
[assembly: AssemblyDescription("Launcher for launchers\\FABRIC-UP.bat")]
[assembly: AssemblyCompany("Blockchain Musical")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace BlockchainMusic.Launchers
{
    internal static class FabricLauncher
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

            string bat = Path.Combine(root, "launchers", "FABRIC-UP.bat");
            if (!File.Exists(bat))
            {
                bat = Path.Combine(root, "FABRIC-UP.bat");
            }
            if (!File.Exists(bat))
            {
                MessageBox.Show(
                    "No se encontro FABRIC-UP.bat en:\n" +
                    Path.Combine(root, "launchers") +
                    "\n\nColoca este ejecutable en la raiz del repositorio Blockchain-Musical-.",
                    "Blockchain MUSIC - Fabric",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            string compose = Path.Combine(root, "docker", "docker-compose.fabric.yml");
            string netCompose = Path.Combine(root, "network", "docker-compose-net.yaml");
            if (!File.Exists(compose) && !File.Exists(netCompose))
            {
                MessageBox.Show(
                    "Faltan archivos de Docker Compose de Fabric en:\n" + root +
                    "\n\nSe esperaba docker\\docker-compose.fabric.yml o network\\docker-compose-net.yaml.",
                    "Blockchain MUSIC - Fabric",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            try
            {
                var dockerCheck = new ProcessStartInfo
                {
                    FileName = "docker",
                    Arguments = "info",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };
                using (var p = Process.Start(dockerCheck))
                {
                    if (p == null)
                    {
                        MessageBox.Show(
                            "No se pudo ejecutar Docker. Instala o inicia Docker Desktop e intentalo de nuevo.",
                            "Blockchain MUSIC - Fabric",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }
                    p.WaitForExit(15000);
                    if (p.ExitCode != 0)
                    {
                        MessageBox.Show(
                            "Docker no esta disponible o no responde. Abre Docker Desktop (icono en verde) y vuelve a ejecutar este lanzador.",
                            "Blockchain MUSIC - Fabric",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }
                }
            }
            catch
            {
                MessageBox.Show(
                    "Docker no esta instalado o no esta en el PATH. Instala Docker Desktop antes de arrancar Fabric.",
                    "Blockchain MUSIC - Fabric",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    "No se pudo iniciar FABRIC-UP.bat:\n" + ex.Message,
                    "Blockchain MUSIC - Fabric",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
