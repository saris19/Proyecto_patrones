import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NOMBRE_COOKIE, validarSesion } from './sesion';

/** Lee la cookie, valida en servidor y redirige al login si no hay sesión válida. */
export async function exigirSesion() {
  const sid = (await cookies()).get(NOMBRE_COOKIE)?.value;
  const sesion = validarSesion(sid);
  if (!sesion) redirect('/login?motivo=sesion');
  return sesion;
}
