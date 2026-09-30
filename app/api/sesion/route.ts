import { NextResponse, type NextRequest } from 'next/server';
import { autenticar, cerrarSesion, cerrarTodas, NOMBRE_COOKIE, opcionesCookie, validarSesion } from '@/lib/sesion';
import { registrar } from '@/lib/auditoria';

/** BFF de sesión: login, cierre y cierre global. */
export async function POST(req: NextRequest) {
  // Anti-CSRF: solo se aceptan formularios enviados desde el mismo origen
  if (!mismoOrigen(req)) {
    return new NextResponse('Origen no permitido', { status: 403 });
  }

  const form = await req.formData();
  const accion = String(form.get('accion') ?? '');
  const ir = (ruta: string) => {
    const r = NextResponse.redirect(new URL(ruta, req.url), 303);
    r.headers.set('Cache-Control', 'private, no-store');
    return r;
  };

  if (accion === 'login') {
    const sesion = autenticar(String(form.get('usuario') ?? ''), String(form.get('clave') ?? ''));
    if (!sesion) return ir('/login?motivo=credenciales');
    registrar({ clienteId: sesion.clienteId, accion: 'LOGIN', resultado: 'OK' });
    const res = ir('/cuentas');
    res.cookies.set(NOMBRE_COOKIE, sesion.id, opcionesCookie);
    return res;
  }

  if (accion === 'salir' || accion === 'salir-todo') {
    const sid = req.cookies.get(NOMBRE_COOKIE)?.value;
    const sesion = validarSesion(sid);
    if (sesion && accion === 'salir-todo') cerrarTodas(sesion.clienteId);
    else cerrarSesion(sid);
    if (sesion) registrar({ clienteId: sesion.clienteId, accion: accion.toUpperCase(), resultado: 'OK' });
    const res = ir('/login?motivo=salio');
    res.cookies.set(NOMBRE_COOKIE, '', { ...opcionesCookie, maxAge: 0 });
    return res;
  }

  return new NextResponse('Acción no válida', { status: 400 });
}

function mismoOrigen(req: NextRequest) {
  const origen = req.headers.get('origin');
  if (!origen || origen === 'null') return false;
  try {
    return new URL(origen).host === req.headers.get('host');
  } catch {
    return false;
  }
}
