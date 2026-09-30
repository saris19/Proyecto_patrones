import type { Metadata } from 'next';
import { Alerta } from '../_components/Alerta';
import { Icono } from '../_components/Icono';

// La página de login es dinámica: muestra mensajes según la URL y nunca se cachea.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Ingresar' };

const mensajes: Record<string, { tipo: 'ok' | 'err' | 'info'; titulo: string; texto: string }> = {
  sesion: { tipo: 'info', titulo: 'Inicie sesión para continuar', texto: 'Su sesión no existe o expiró tras 5 minutos de inactividad.' },
  credenciales: { tipo: 'err', titulo: 'No pudimos validar sus datos', texto: 'Revise el usuario y la clave. Las mayúsculas cuentan.' },
  salio: { tipo: 'ok', titulo: 'Sesión cerrada', texto: 'La sesión se eliminó del servidor. Puede cerrar esta ventana.' },
};

export default async function Login({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const msg = motivo ? mensajes[motivo] : undefined;
  return (
    <div className="container page">
      <div className="split">
        <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
          <span className="eyebrow"><Icono nombre="candado" size={14} /> Acceso seguro</span>
          <h1 className="h1">Ingrese a su banca en línea</h1>
          <p className="lead">Sus credenciales viajan solo al servidor del banco. El navegador nunca recibe tokens.</p>
          <ul className="checklist" style={{ marginTop: 8 }}>
            <li><Icono nombre="check" /><span><b>Cookie HttpOnly</b>JavaScript no puede leer su sesión.</span></li>
            <li><Icono nombre="check" /><span><b>Validación de origen</b>Se rechazan formularios enviados desde otros sitios.</span></li>
            <li><Icono nombre="check" /><span><b>Cierre automático</b>La sesión expira tras 5 minutos sin actividad.</span></li>
          </ul>
        </div>

        <section className="panel">
          <div className="panel__body form">
            <h2 className="h3">Datos de acceso</h2>
            {msg && <Alerta tipo={msg.tipo} titulo={msg.titulo}>{msg.texto}</Alerta>}
            {/* Formulario HTML clásico: funciona sin JavaScript y envía la clave solo al BFF */}
            <form method="post" action="/api/sesion" className="form">
              <input type="hidden" name="accion" value="login" />
              <div className="field">
                <label className="field__label" htmlFor="usuario">Usuario</label>
                <input id="usuario" className="input" name="usuario" required autoComplete="username" placeholder="ana" />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="clave">Clave</label>
                <input id="clave" className="input" name="clave" type="password" required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn--primary btn--lg btn--block">
                Ingresar <span className="arrow" aria-hidden>→</span>
              </button>
            </form>
            <p className="meta">Demo: <code>ana / Ana2026*</code> · <code>luis / Luis2026*</code></p>
          </div>
        </section>
      </div>
    </div>
  );
}
