import Link from 'next/link';
import type { Metadata } from 'next';
import { exigirSesion } from '@/lib/sesion-actual';
import { enmascarar, obtenerCliente } from '@/lib/core';
import { eventosDe, registrar } from '@/lib/auditoria';
import { Icono } from '../../_components/Icono';
import { fechaCorta, fechaHora, hora, pesos } from '../../_components/formato';

/**
 * ZONA PRIVADA → SSR dinámico.
 * 1. Valida la sesión en el servidor en cada petición (R3, R4).
 * 2. Consulta el core con credenciales del servidor (BFF, R2).
 * 3. Solo envía al HTML datos enmascarados (R1).
 * 4. Registra la consulta (R5).
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mis cuentas' };

export default async function Cuentas() {
  const sesion = await exigirSesion();
  const cliente = await obtenerCliente(sesion.clienteId);
  registrar({ clienteId: sesion.clienteId, accion: 'CONSULTA_SALDOS', resultado: 'OK' });
  const total = cliente.cuentas.reduce((s, c) => s + c.saldo, 0);
  const ahora = new Date().toISOString();

  return (
    <div className="container page" style={{ paddingTop: 48 }}>
      <section className="balance">
        <span className="eyebrow">Saldo total disponible</span>
        <span className="balance__value">{pesos(total)}</span>
        <span className="meta mono">Renderizado en el servidor a las {hora(ahora)} · Cache-Control: private, no-store</span>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <Link href="/transferir" className="btn btn--primary">
            <Icono nombre="transferir" size={16} /> Transferir
          </Link>
        </div>
      </section>

      <div className="grid grid--2" style={{ marginBottom: 24 }}>
        {/* key sin el número real: las keys de React viajan en el payload RSC dentro del HTML */}
        {cliente.cuentas.map((c) => (
          <article key={c.numero.slice(-4)} className="card account">
            <div className="account__top">
              <span className="card__icon"><Icono nombre={c.tipo === 'Ahorros' ? 'alcancia' : 'tarjeta'} /></span>
              <span className="mono meta">{enmascarar(c.numero)}</span>
            </div>
            <div>
              <p className="muted small">Cuenta {c.tipo.toLowerCase()}</p>
              <p className="account__amount">{pesos(c.saldo)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24 }}>
        <section className="panel">
          <div className="panel__head">
            <h2 className="h3">Últimos movimientos</h2>
            <span className="meta">{cliente.movimientos.length} registros</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">Fecha</th><th scope="col">Descripción</th><th scope="col" className="num">Valor</th></tr>
              </thead>
              <tbody>
                {cliente.movimientos.slice(0, 8).map((m, i) => (
                  <tr key={i}>
                    <td className="mono meta">{fechaCorta(m.fecha)}</td>
                    <td>{m.descripcion}</td>
                    <td className={`num ${m.valor < 0 ? 'neg' : 'pos'}`}>
                      {m.valor > 0 ? '+' : '−'}{pesos(Math.abs(m.valor))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2 className="h3">Auditoría de la sesión</h2>
            <span className="meta mono">R5</span>
          </div>
          <div className="table-wrap">
            <table>
              <tbody>
                {eventosDe(sesion.clienteId, 6).map((e, i) => (
                  <tr key={i}>
                    <td>
                      <div className="mono small">{e.accion}</div>
                      <div className="meta mono">{fechaHora(e.fecha)}</div>
                    </td>
                    <td className="num">
                      <span className={`badge badge--${e.resultado === 'OK' ? 'ok' : 'err'}`}>{e.resultado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
