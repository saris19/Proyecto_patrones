import Link from 'next/link';
import { Marca } from './Marca';
import { Icono } from './Icono';

const enlaces = [
  { href: '/productos', texto: 'Productos', tag: 'SSG' },
  { href: '/tasas', texto: 'Tasas', tag: 'ISR' },
  { href: '/cuentas', texto: 'Mis cuentas', tag: 'SSR' },
  { href: '/transferir', texto: 'Transferir', tag: 'SSR' },
];

/** Navegación sin JavaScript: el menú móvil usa <details>, compatible con la CSP estricta. */
export function Navbar() {
  return (
    <header className="nav">
      <nav className="container nav__inner" aria-label="Principal">
        <Marca />
        <div className="nav__links">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="nav__link">
              {e.texto}
              <span className="tag">{e.tag}</span>
            </Link>
          ))}
        </div>
        <div className="nav__cta">
          {/* El menú es estático (SSG): no puede saber si hay sesión sin volverse dinámico.
              Por eso el botón lleva a /cuentas, que redirige al login solo si hace falta. */}
          <Link href="/cuentas" className="btn btn--primary">
            Banca en línea <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>
        <details className="nav__menu">
          <summary aria-label="Abrir menú">
            <Icono nombre="menu" />
          </summary>
          <div className="nav__panel">
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href}>
                {e.texto} <span className="meta mono">{e.tag}</span>
              </Link>
            ))}
            <Link href="/cuentas" className="btn btn--primary">Banca en línea</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
