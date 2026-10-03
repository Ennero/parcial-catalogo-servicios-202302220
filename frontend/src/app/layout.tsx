import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'Catálogo de Servicios de TI — USAC',
  description: 'Sistema de gobernanza del catálogo de servicios de TI, estructura organizacional e ITIL/RACI.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#fafafa] min-h-screen text-zinc-900 antialiased flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-zinc-200 bg-white py-5 text-center text-[11px] text-zinc-500 font-mono tracking-wide">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800">USAC / Software Avanzado</span>
                <span className="text-zinc-300">|</span>
                <span>Parcial Práctico 2026</span>
              </div>
              <div className="text-zinc-400">
                Estudiante: <span className="text-zinc-700 font-medium">Enner (202302220)</span> &middot; Evaluador: <span className="text-zinc-700 font-medium">maldanap-usac</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
