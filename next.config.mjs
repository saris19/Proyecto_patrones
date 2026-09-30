/** Cabeceras de endurecimiento aplicadas a TODAS las zonas. */
const cabecerasGlobales = [
  // HSTS solo detrás de HTTPS real: en http://localhost haría que el navegador fuerce https y rompa la demo
  ...(process.env.HABILITAR_HSTS === '1'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // 'same-origin' y no 'no-referrer': con no-referrer los formularios envían `Origin: null`
  // y la validación anti-CSRF por origen rechazaría incluso las peticiones legítimas
  { key: 'Referrer-Policy', value: 'same-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: cabecerasGlobales }];
  },
};

export default nextConfig;
