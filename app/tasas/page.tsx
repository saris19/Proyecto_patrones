import type { Metadata } from 'next';
import { obtenerTasas } from '@/lib/tasas';
import { Zona } from '../_components/Zona';
import { hora } from '../_components/formato';

/**
 * ZONA SEMIPÚBLICA → ISR.
 * Se sirve estática y se regenera como máximo cada 60 s (o a demanda con /api/revalidar).
 * PROHIBIDO aquí: cookies(), headers(), searchParams o cualquier dato del usuario:
 * el HTML resultante se comparte con TODOS los visitantes.
 */
export const revalidate = 60;
export const metadata: Metadata = { title: 'Tasas' };

export default async function Tasas() {
  const { tasas, trm, generadoEn } = await obtenerTasas();
  return (
    <div className="container page">
      <header className="page__head">
        <Zona tipo="semi" detalle="ISR · revalidate 60 s" />
        <h1 className="h1">Tasas y TRM del día</h1>
        <p className="lead">Datos públicos que cambian durante el día. La página es estática, pero se regenera en segundo plano.</p>
      </header>

      <div className="metrics" style={{ marginBottom: 24 }}>
        <div className="metric">
          <span className="metric__label">TRM de referencia</span>
          <span className="metric__value">${trm.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Versión generada</span>
          <span className="metric__value">{hora(generadoEn)}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Próxima regeneración</span>
          <span className="metric__value">≤ 60 s</span>
        </div>
        <div className="metric">
          <span className="metric__label">Estado</span>
          <span className="metric__value" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20 }}>
            <span className="status-dot" aria-hidden /> En caché
          </span>
        </div>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2 className="h3">Tasas vigentes</h2>
          <span className="meta">Efectiva anual · recargue: la hora solo cambia cuando la página se regenera</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th scope="col">Producto</th><th scope="col" className="num">Tasa E.A.</th></tr>
            </thead>
            <tbody>
              {tasas.map((t) => (
                <tr key={t.producto}>
                  <td>{t.producto}</td>
                  <td className="num">{t.tasaEA.toFixed(2)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
