import type { Metadata } from 'next';
import { exigirSesion } from '@/lib/sesion-actual';
import { enmascarar, obtenerCliente } from '@/lib/core';
import { ejecutarTransferencia } from './actions';
import { Alerta } from '../../_components/Alerta';
import { BotonEnviar } from '../../_components/BotonEnviar';
import { Icono } from '../../_components/Icono';
import { pesos } from '../../_components/formato';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Transferir' };

export default async function Transferir({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const sesion = await exigirSesion();
  const cliente = await obtenerCliente(sesion.clienteId);
  const { ok, error } = await searchParams;

  return (
    <div className="container page" style={{ paddingTop: 48 }}>
      <header className="page__head" style={{ marginBottom: 32 }}>
        <span className="eyebrow"><Icono nombre="transferir" size={14} /> Operación transaccional</span>
        <h1 className="h1">Transferir dinero</h1>
        <p className="lead">Entre sus cuentas y las cuentas que ya tiene inscritas.</p>
      </header>

      <div className="split--form split">
        <section className="panel">
          <div className="panel__body form">
            {ok && <Alerta tipo="ok" titulo="Transferencia realizada">El movimiento ya aparece en sus cuentas y quedó registrado en auditoría.</Alerta>}
            {error && <Alerta tipo="err" titulo="No se realizó la transferencia">{error}. Revise los datos e intente de nuevo.</Alerta>}

            {/* Solo viajan al navegador los últimos 4 dígitos: el servidor resuelve el número real */}
            <form action={ejecutarTransferencia} className="form">
              <div className="field">
                <label className="field__label" htmlFor="origen">Cuenta origen</label>
                <select id="origen" className="select" name="origen" required>
                  {cliente.cuentas.map((c) => (
                    <option key={c.numero.slice(-4)} value={c.numero.slice(-4)}>
                      {c.tipo} {enmascarar(c.numero)} — {pesos(c.saldo)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="destino">Cuenta destino</label>
                <select id="destino" className="select" name="destino" required>
                  {cliente.inscritas.map((n) => (
                    <option key={n.slice(-4)} value={n.slice(-4)}>Cuenta inscrita {enmascarar(n)}</option>
                  ))}
                </select>
                <span className="field__help">Solo puede enviar a cuentas inscritas previamente.</span>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="valor">Valor en pesos</label>
                <input id="valor" className="input mono" name="valor" type="number" min={1000} step={1000} required placeholder="100000" inputMode="numeric" />
                <span className="field__help">Mínimo $1.000 · tope diario $5.000.000</span>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="otp">Código de verificación</label>
                <input id="otp" className="input input--mono" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder="••••••" autoComplete="one-time-code" />
                <span className="field__help">6 dígitos enviados a su celular. Demo: <code>123456</code></span>
              </div>
              <BotonEnviar pendiente="Validando en el servidor…">
                Confirmar transferencia <span className="arrow" aria-hidden>→</span>
              </BotonEnviar>
            </form>
          </div>
        </section>

        <aside className="panel">
          <div className="panel__head"><h2 className="h3">Qué valida el servidor</h2></div>
          <div className="panel__body">
            <ul className="checklist">
              <li><Icono nombre="check" /><span><b>Sesión vigente</b>Se revalida al enviar, no solo al abrir la página.</span></li>
              <li><Icono nombre="check" /><span><b>Propiedad de la cuenta</b>La cuenta origen debe pertenecer al cliente.</span></li>
              <li><Icono nombre="check" /><span><b>Destino inscrito</b>No se aceptan cuentas nuevas en esta operación.</span></li>
              <li><Icono nombre="check" /><span><b>Monto y saldo</b>Tope diario y saldo suficiente.</span></li>
              <li><Icono nombre="check" /><span><b>Segundo factor</b>OTP de 6 dígitos.</span></li>
              <li><Icono nombre="check" /><span><b>Origen de la petición</b>Server Action con verificación anti-CSRF.</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
