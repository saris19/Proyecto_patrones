import { cookies } from 'next/headers';
import { NOMBRE_COOKIE, validarSesion } from '@/lib/sesion';
import { obtenerCliente, pesos } from '@/lib/core';

/**
 * ANTIPATRÓN — SOLO PARA CLASE. Se activa con DEMO_INSEGURO=1.
 * Simula lo que pasa cuando una página personalizada se trata como ISR / se
 * publica con `Cache-Control: public, s-maxage=60`: un CDN o proxy la guarda
 * por URL (sin mirar la cookie) y se la entrega al siguiente visitante.
 * Pruebe: inicie sesión como ana en un navegador, abra /demo-inseguro;
 * luego inicie sesión como luis en otro navegador y abra /demo-inseguro.
 */
export const dynamic = 'force-dynamic';

const g = globalThis as unknown as { __cdnSimulado?: Map<string, { html: string; t: number }> };
const cdn = (g.__cdnSimulado ??= new Map());
const TTL = 60_000;

export async function GET() {
  if (process.env.DEMO_INSEGURO !== '1') return new Response('No encontrado', { status: 404 });

  const hit = cdn.get('/demo-inseguro');
  if (hit && Date.now() - hit.t < TTL) {
    return html(hit.html, 'HIT', Math.round((TTL - (Date.now() - hit.t)) / 1000));
  }

  const sesion = validarSesion((await cookies()).get(NOMBRE_COOKIE)?.value);
  if (!sesion) return html('<p>Inicie sesión en <a href="/login">/login</a> y vuelva.</p>', 'BYPASS', 0, false);

  const c = await obtenerCliente(sesion.clienteId);
  const cuerpo = `<p><strong>${sesion.nombre}</strong> (${sesion.clienteId})</p><ul>${c.cuentas
    .map((x) => `<li>${x.tipo} ${x.numero}: ${pesos(x.saldo)}</li>`)
    .join('')}</ul><p>Generado: ${new Date().toISOString()}</p>`;
  cdn.set('/demo-inseguro', { html: cuerpo, t: Date.now() });
  return html(cuerpo, 'MISS', 60);
}

function html(cuerpo: string, estado: string, restante: number, publico = true) {
  const pagina = `<!doctype html><meta charset="utf-8"><title>Demo inseguro</title>
<body style="font-family:system-ui;max-width:640px;margin:40px auto;padding:0 16px">
<h1 style="color:#c62828">⚠ Antipatrón: página personalizada en caché compartida</h1>
<p>Caché simulada: <strong>${estado}</strong>${estado === 'HIT' ? ` (expira en ${restante} s)` : ''}</p>
${cuerpo}
<p style="color:#666">Si otro usuario ve estos datos, reprodujo la fuga. La corrección está en /cuentas:
SSR dinámico con <code>Cache-Control: private, no-store</code>.</p></body>`;
  return new Response(pagina, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': publico ? 'public, s-maxage=60' : 'private, no-store',
      'X-Cache-Simulada': estado,
    },
  });
}
