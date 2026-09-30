import Link from 'next/link';
import type { Metadata } from 'next';
import { Zona } from '../../_components/Zona';
import { Icono, type NombreIcono } from '../../_components/Icono';

// ZONA PÚBLICA → SSG. Solo contenido institucional, idéntico para todos.
export const dynamic = 'force-static';
export const metadata: Metadata = { title: 'Productos' };

const productos: { icono: NombreIcono; nombre: string; texto: string; dato: string }[] = [
  { icono: 'alcancia', nombre: 'Cuenta de ahorros Andina', texto: 'Sin cuota de manejo y retiros gratis en la red propia.', dato: '1,50 % E.A.' },
  { icono: 'tarjeta', nombre: 'Tarjeta de crédito Cóndor', texto: 'Compras por internet protegidas con 3-D Secure.', dato: 'Cupo desde $1.000.000' },
  { icono: 'grafica', nombre: 'Crédito de libre inversión', texto: 'Tasa fija y cuotas iguales durante todo el plazo.', dato: '12 a 72 meses' },
  { icono: 'documento', nombre: 'CDT digital', texto: 'Ábralo desde la app en minutos, sin ir a una oficina.', dato: 'Desde 90 días' },
];

export default function Productos() {
  return (
    <div className="container page">
      <header className="page__head">
        <Zona tipo="publica" />
        <h1 className="h1">Productos</h1>
        <p className="lead">Contenido institucional compilado en el build y servido desde el CDN. No depende de quién lo pide.</p>
      </header>
      <div className="grid grid--4">
        {productos.map((p) => (
          <article key={p.nombre} className="card card--hover">
            <span className="card__icon"><Icono nombre={p.icono} /></span>
            <h2 className="h3">{p.nombre}</h2>
            <p className="muted small">{p.texto}</p>
            <div className="card__foot">
              <span className="mono small">{p.dato}</span>
            </div>
          </article>
        ))}
      </div>
      <p className="meta" style={{ marginTop: 32 }}>
        ¿Quiere ver las tasas vigentes? <Link href="/tasas" style={{ color: 'var(--accent)' }}>Consulte la tabla actualizada →</Link>
      </p>
    </div>
  );
}
