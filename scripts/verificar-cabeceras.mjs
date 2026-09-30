/**
 * Prueba de la frontera de zonas (pregunta 5 del caso).
 * Uso: con la app corriendo (npm run build && npm start), ejecutar `npm run verificar`.
 * Falla (exit 1) si una ruta privada puede quedar en una caché compartida.
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
let fallos = 0;

function comprobar(nombre, condicion, detalle) {
  console.log(`${condicion ? '✔' : '✘'} ${nombre}${detalle ? `  →  ${detalle}` : ''}`);
  if (!condicion) fallos++;
}

async function get(ruta, cookie) {
  return fetch(BASE + ruta, { redirect: 'manual', headers: cookie ? { cookie } : {} });
}

// 1. Zona pública y semipública: cacheables, sin cookies de sesión
for (const ruta of ['/', '/productos', '/tasas']) {
  const r = await get(ruta);
  const cc = r.headers.get('cache-control') ?? '';
  comprobar(`${ruta} es cacheable (pública)`, r.status === 200 && !/private|no-store/.test(cc), cc);
  comprobar(`${ruta} no emite cookies`, !r.headers.get('set-cookie'));
}

// 2. Zona privada sin sesión: redirige y no se cachea
for (const ruta of ['/cuentas', '/transferir']) {
  const r = await get(ruta);
  comprobar(`${ruta} sin sesión redirige a /login`, [302, 307].includes(r.status), `${r.status} ${r.headers.get('location')}`);
}

// 3. Login por el BFF
const login = await fetch(BASE + '/api/sesion', {
  method: 'POST',
  redirect: 'manual',
  headers: { origin: BASE, 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ accion: 'login', usuario: 'ana', clave: 'Ana2026*' }),
});
const setCookie = login.headers.get('set-cookie') ?? '';
comprobar('login responde 303', login.status === 303);
comprobar('cookie con prefijo __Host-', setCookie.startsWith('__Host-sid='));
comprobar('cookie HttpOnly', /httponly/i.test(setCookie));
comprobar('cookie Secure', /secure/i.test(setCookie));
comprobar('cookie SameSite=Strict', /samesite=strict/i.test(setCookie));
const cookie = setCookie.split(';')[0];

// 4. Zona privada con sesión: private, no-store, CSP y datos enmascarados
for (const ruta of ['/cuentas', '/transferir']) {
  const r = await get(ruta, cookie);
  const cc = r.headers.get('cache-control') ?? '';
  const html = await r.text();
  comprobar(`${ruta} con sesión responde 200`, r.status === 200, String(r.status));
  comprobar(`${ruta} Cache-Control private + no-store`, /private/.test(cc) && /no-store/.test(cc), cc);
  comprobar(`${ruta} tiene CSP con nonce`, /nonce-/.test(r.headers.get('content-security-policy') ?? ''));
  comprobar(`${ruta} no expone el número de cuenta completo`, !html.includes('0012004821'));
}

// 5. CSRF: login desde otro origen es rechazado
const csrf = await fetch(BASE + '/api/sesion', {
  method: 'POST',
  redirect: 'manual',
  headers: { origin: 'https://atacante.example', 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ accion: 'login', usuario: 'ana', clave: 'Ana2026*' }),
});
comprobar('login desde otro origen → 403', csrf.status === 403, String(csrf.status));

// 6. Revalidación sin firma es rechazada
const rev = await fetch(BASE + '/api/revalidar', { method: 'POST', body: '{"ruta":"/tasas"}' });
comprobar('revalidación sin firma rechazada', [401, 503].includes(rev.status), String(rev.status));

console.log(fallos ? `\n${fallos} comprobación(es) fallaron` : '\nTodas las comprobaciones pasaron');
process.exit(fallos ? 1 : 0);
