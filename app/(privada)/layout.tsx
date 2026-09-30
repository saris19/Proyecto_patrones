import { exigirSesion } from '@/lib/sesion-actual';
import { Zona } from '../_components/Zona';
import { Icono } from '../_components/Icono';

// Todo lo que cuelga de (privada) es SSR dinámico: nunca estático, nunca en caché.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const sesion = await exigirSesion();
  const iniciales = sesion.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <>
      <div className="sessionbar">
        <div className="container sessionbar__inner">
          <div className="sessionbar__who">
            <span className="avatar" aria-hidden>{iniciales}</span>
            <span>
              {sesion.nombre}
              <small>sesión activa · expira tras 5 min sin actividad</small>
            </span>
          </div>
          <Zona tipo="privada" detalle="SSR · no-store" />
          <form method="post" action="/api/sesion">
            <button className="btn btn--quiet" name="accion" value="salir">
              <Icono nombre="salir" size={16} /> Salir
            </button>
            <button className="btn btn--quiet" name="accion" value="salir-todo" title="Cierra la sesión en todos los dispositivos">
              Salir de todos
            </button>
          </form>
        </div>
      </div>
      {children}
    </>
  );
}
