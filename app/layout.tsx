import type { Metadata, Viewport } from 'next';
// Fuentes empaquetadas por npm: se sirven desde el propio dominio (compatible con la CSP 'self')
// y el build no depende de conexión a Google Fonts.
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { Navbar } from './_components/Navbar';
import { Footer } from './_components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Banco Andino Digital', template: '%s · Banco Andino Digital' },
  description: 'Caso de estudio: patrones de rendering CSR, SSR, SSG e ISR aplicados con seguridad (entidad ficticia)',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0d10' },
    { media: '(prefers-color-scheme: light)', color: '#fbfbfc' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#contenido" className="sr-only">Saltar al contenido</a>
        <Navbar />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
