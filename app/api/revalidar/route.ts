import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';

/**
 * Revalidación A DEMANDA de la zona ISR.
 * Tesorería firma el cuerpo con HMAC-SHA256 y un secreto compartido.
 * Ejemplo:
 *   BODY='{"ruta":"/tasas"}'
 *   FIRMA=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$REVALIDAR_SECRETO" -hex | cut -d' ' -f2)
 *   curl -X POST localhost:3000/api/revalidar -H "x-firma-hmac: $FIRMA" -d "$BODY"
 */
const PERMITIDAS = new Set(['/tasas']); // nunca rutas privadas

export async function POST(req: Request) {
  const secreto = process.env.REVALIDAR_SECRETO;
  if (!secreto) return new Response('Revalidación deshabilitada', { status: 503 });

  const cuerpo = await req.text();
  const firma = Buffer.from(req.headers.get('x-firma-hmac') ?? '', 'hex');
  const esperada = createHmac('sha256', secreto).update(cuerpo).digest();
  if (firma.length !== esperada.length || !timingSafeEqual(firma, esperada)) {
    return new Response('No autorizado', { status: 401 });
  }

  let ruta = '';
  try {
    ruta = JSON.parse(cuerpo).ruta;
  } catch {
    return new Response('JSON inválido', { status: 400 });
  }
  if (!PERMITIDAS.has(ruta)) return new Response('Ruta no permitida', { status: 400 });

  revalidatePath(ruta);
  return Response.json({ ok: true, ruta, en: new Date().toISOString() });
}
