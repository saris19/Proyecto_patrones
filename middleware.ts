import { NextResponse, type NextRequest } from 'next/server';

/**
 * FRONTERA DE ZONAS.
 * - Zona privada: exige cookie de sesión, prohíbe cualquier caché y aplica CSP con nonce.
 * - La validación REAL de la sesión ocurre en el servidor de cada página (defensa en profundidad);
 *   aquí solo se filtra rápido.
 */
const RUTAS_PRIVADAS = ['/cuentas', '/transferir'];
const COOKIE = '__Host-sid';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const esPrivada = RUTAS_PRIVADAS.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (!esPrivada) return NextResponse.next();

  if (!req.cookies.get(COOKIE)) {
    const res = NextResponse.redirect(new URL('/login?motivo=sesion', req.url));
    res.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return res;
  }

  // CSP estricta con nonce (solo posible en rutas dinámicas)
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== 'production';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join('; ');

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);
  reqHeaders.set('Content-Security-Policy', csp); // Next toma el nonce de aquí

  const res = NextResponse.next({ request: { headers: reqHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Cache-Control', 'private, no-store, max-age=0'); // R1
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Vary', 'Cookie');
  return res;
}

export const config = {
  matcher: ['/cuentas/:path*', '/transferir/:path*'],
};
