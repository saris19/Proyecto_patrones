# Banco Andino Digital — Rendering seguro por zonas

Proyecto de referencia del caso de estudio **"Patrones de rendering (CSR, SSR, SSG, ISR) en banca en línea"**.
Banco Andino Digital es una entidad ficticia; todos los datos son de demostración.

La regla que implementa: **lo que se cachea no se personaliza, y lo que se personaliza no se cachea.**

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar

```bash
npm install
cp .env.example .env.local      # ajuste REVALIDAR_SECRETO
npm run build
npm start                       # http://localhost:3000
```

En otra terminal, con la app corriendo:

```bash
npm run verificar               # prueba automática de la frontera de zonas
```

Usuarios de demostración: `ana / Ana2026*` y `luis / Luis2026*`. OTP de demostración: `123456`.

> Use `npm run build && npm start` (modo producción) para ver ISR y SSG de verdad.
> En `npm run dev` todas las páginas se renderizan en cada petición.

## Mapa de zonas

| Zona | Ruta | Patrón | Cache-Control observado | Archivo |
| --- | --- | --- | --- | --- |
| Pública | `/`, `/productos` | SSG | `s-maxage=31536000` | `app/(publica)/` |
| Semipública | `/tasas` | ISR (60 s + a demanda) | `s-maxage=60, stale-while-revalidate` | `app/tasas/page.tsx` |
| Privada | `/cuentas` | SSR dinámico | `private, no-store` | `app/(privada)/cuentas/page.tsx` |
| Transaccional | `/transferir` | SSR + Server Action + OTP | `private, no-store` | `app/(privada)/transferir/` |
| Frontera | todas las privadas | Middleware + CSP con nonce | — | `middleware.ts` |
| Sesión (BFF) | `POST /api/sesion` | Route Handler | `private, no-store` | `app/api/sesion/route.ts` |
| Antipatrón | `/demo-inseguro` | Caché compartida simulada | `public, s-maxage=60` | `app/demo-inseguro/route.ts` |

## Estructura

```
app/
  (publica)/page.tsx              SSG
  (publica)/productos/page.tsx    SSG
  tasas/page.tsx                  ISR (revalidate = 60)
  api/revalidar/route.ts          revalidación a demanda firmada con HMAC
  api/sesion/route.ts             BFF: login, salir, salir de todos los dispositivos
  login/page.tsx                  formulario (funciona sin JavaScript)
  (privada)/layout.tsx            valida sesión; fuerza dinámico y no-store
  (privada)/cuentas/page.tsx      SSR: saldos enmascarados + auditoría
  (privada)/transferir/           Server Action con OTP y revalidación en servidor
  demo-inseguro/route.ts          ANTIPATRÓN para clase (DEMO_INSEGURO=1)
lib/
  sesion.ts                       sesiones en servidor, scrypt, inactividad 5 min
  core.ts                         core bancario simulado, enmascarado
  auditoria.ts                    registro de operaciones (R5)
  tasas.ts                        datos públicos variables
middleware.ts                     frontera de zonas, CSP, cabeceras no-store
next.config.mjs                   cabeceras de endurecimiento globales
scripts/verificar-cabeceras.mjs   prueba automática (23 comprobaciones)
```

## Diseño de la interfaz

- Sistema de diseño con tokens en `app/globals.css` (espaciado, radios, color, tipografía).
- Tema oscuro y claro automáticos según el sistema operativo (`prefers-color-scheme`).
- Componentes reutilizables en `app/_components/` (Navbar, Zona, Alerta, Icono, BotonEnviar…).
- Fuentes Inter y JetBrains Mono empaquetadas por npm (`@fontsource-variable/*`): se sirven desde el
  propio dominio, así la CSP `'self'` no se rompe y el build no necesita conexión a Google Fonts.
- Navegación móvil sin JavaScript (`<details>`), accesible con teclado y compatible con la CSP estricta.
- El botón de transferencia muestra estado de carga (`useFormStatus`) para evitar el doble envío.
- Accesible: HTML semántico, foco visible, etiquetas en formularios, respeta `prefers-reduced-motion`,
  y los estados nunca se comunican solo con color (texto + signo en montos, etiqueta en zonas).

## Controles implementados

| Requisito | Control | Dónde |
| --- | --- | --- |
| R1 Sin datos en caché compartida | `private, no-store`, `Vary: Cookie`, enmascarado `****4821` | `middleware.ts`, `lib/core.ts` |
| R2 Tokens fuera de JS | Cookie `__Host-sid` `HttpOnly; Secure; SameSite=Strict`; el navegador nunca ve tokens del core | `lib/sesion.ts` |
| R3 Autorización en servidor | Sesión validada en cada página y en cada acción; el core revalida cuenta, destino y monto | `lib/sesion-actual.ts`, `lib/core.ts` |
| R4 Control de sesión | Inactividad 5 min, ID nuevo en cada login, cierre global | `lib/sesion.ts` |
| R5 Trazabilidad | Registro de LOGIN, CONSULTA_SALDOS, TRANSFERENCIA (OK / RECHAZADO) | `lib/auditoria.ts` |
| CSRF | Verificación de `Origin` en el BFF; Server Actions con verificación nativa | `app/api/sesion/route.ts` |
| XSS | CSP con nonce y `strict-dynamic` en zona privada | `middleware.ts` |

## Actividades

### 1. Observar las cabeceras

Abra DevTools → Network y compare `Cache-Control` en `/`, `/tasas` y `/cuentas`.

### 2. Ver ISR en acción

Recargue `/tasas`: la hora de "Versión generada" solo cambia tras 60 s. Para forzar la regeneración:

```bash
BODY='{"ruta":"/tasas"}'
FIRMA=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$REVALIDAR_SECRETO" -hex | awk '{print $NF}')
curl -X POST localhost:3000/api/revalidar -H "x-firma-hmac: $FIRMA" -d "$BODY"
```

### 3. Reproducir la fuga (antipatrón)

```bash
npm run build && npm run start:inseguro
```

1. Navegador A (normal): ingrese como `ana` y abra `/demo-inseguro` → `MISS`, ve sus saldos.
2. Navegador B (incógnito): ingrese como `luis` y abra `/demo-inseguro` → `HIT`, **ve los saldos de Ana**.
3. Abra `/cuentas` con Luis: ve los suyos. Explique la diferencia.

## Hallazgos durante el desarrollo (úselos en clase)

Dos fallos reales aparecieron al construir este proyecto y los detectó la prueba automática o el navegador:

1. **Las `key` de React viajan al navegador.** Usar `key={cuenta.numero}` en un Server Component metía el
   número de cuenta completo en el payload RSC del HTML, aunque en pantalla solo se veía `****4821`.
   Corrección: keys sin datos sensibles. Lección: todo lo que toca el árbol de React del servidor puede terminar
   en el HTML.
2. **`Referrer-Policy: no-referrer` rompe la validación de `Origin`.** Con esa política el navegador envía
   `Origin: null` en los formularios, y el BFF rechazaba incluso los logins legítimos. Corrección:
   `Referrer-Policy: same-origin`. Lección: los controles de seguridad interactúan entre sí; hay que probarlos
   juntos.

Además, `Strict-Transport-Security` solo se envía con `HABILITAR_HSTS=1`, porque en `http://localhost`
haría que el navegador fuerce HTTPS y la demo deje de funcionar. En producción debe estar activo.

## Qué NO es este proyecto

Es material didáctico. Las sesiones, usuarios, core y auditoría viven en memoria, el OTP es fijo y no hay
límite de intentos ni bloqueo de cuenta. Un sistema real necesita almacén de sesiones distribuido (Redis),
HSM o bóveda de secretos, OTP ligado a la transacción, rate limiting, WAF y auditoría inmutable.
