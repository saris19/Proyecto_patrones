import Link from 'next/link';
import { Zona, type TipoZona } from '../_components/Zona';
import { Icono } from '../_components/Icono';

// ZONA PÚBLICA → SSG: se genera una vez en el build y se sirve igual a todos desde el CDN.
export const dynamic = 'force-static';

const zonas: { tipo: TipoZona; titulo: string; texto: string; rutas: string; cache: string; patron: string }[] = [
  {
    tipo: 'publica',
    titulo: 'Contenido institucional',
    texto: 'Idéntico para todos. Se compila una vez y se sirve desde el borde.',
    rutas: '/  /productos',
    cache: 'public, s-maxage=31536000',
    patron: 'SSG',
  },
  {
    tipo: 'semi',
    titulo: 'Datos públicos que cambian',
    texto: 'Tasas y TRM. Estático y rápido, pero se regenera cada 60 s o a demanda.',
    rutas: '/tasas',
    cache: 'public, s-maxage=60, swr',
    patron: 'ISR',
  },
  {
    tipo: 'privada',
    titulo: 'Información del cliente',
    texto: 'Saldos y transferencias. Se renderiza por petición y nunca se guarda en caché.',
    rutas: '/cuentas  /transferir',
    cache: 'private, no-store',
    patron: 'SSR',
  },
];

const metricas = [
  { valor: '0', texto: 'tokens del core en el navegador' },
  { valor: '60 s', texto: 'ventana de regeneración ISR' },
  { valor: '5 min', texto: 'expiración por inactividad' },
  { valor: '23', texto: 'comprobaciones automáticas' },
];

export default function Inicio() {
  const generado = new Date().toISOString();
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy fade-in">
            <span className="eyebrow">
              <Icono nombre="escudo" size={14} /> Caso de estudio · Rendering seguro
            </span>
            <h1 className="display">
              Lo que se cachea <em>no se personaliza.</em>
            </h1>
            <p className="lead">
              Una banca en línea que elige SSG, ISR o SSR según la sensibilidad del dato, no según la página. Rápida
              donde puede serlo, hermética donde debe serlo.
            </p>
            <div className="hero__actions">
              <Link href="/login" className="btn btn--primary btn--lg">
                Entrar a la zona privada <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link href="/tasas" className="btn btn--ghost btn--lg">Ver ISR en acción</Link>
            </div>
            <p className="meta mono">HTML generado en el build · {generado}</p>
          </div>

          <div className="console fade-in" aria-label="Cabeceras HTTP por zona">
            <div className="console__bar">
              <span className="console__dots" aria-hidden><i /><i /><i /></span>
              respuestas HTTP
            </div>
            <div className="console__body">
              <div className="req">
                <div className="req__line"><span className="req__method">GET</span><span className="req__path">/productos</span><span className="req__status">200 · SSG</span></div>
                <div className="req__h"><b>cache-control:</b> public, s-maxage=31536000</div>
              </div>
              <div className="req">
                <div className="req__line"><span className="req__method">GET</span><span className="req__path">/tasas</span><span className="req__status">200 · ISR</span></div>
                <div className="req__h"><b>cache-control:</b> s-maxage=60, stale-while-revalidate</div>
              </div>
              <div className="req">
                <div className="req__line"><span className="req__method">GET</span><span className="req__path">/cuentas</span><span className="req__status">200 · SSR</span></div>
                <div className="req__h"><b>cache-control:</b> <span className="hl">private, no-store</span></div>
                <div className="req__h"><b>vary:</b> Cookie</div>
                <div className="req__h"><b>content-security-policy:</b> script-src &apos;nonce-…&apos;</div>
              </div>
              <div className="req">
                <div className="req__line"><span className="req__method">POST</span><span className="req__path">/api/sesion</span><span className="req__status">303</span></div>
                <div className="req__h"><b>set-cookie:</b> __Host-sid=…; <span className="hl">HttpOnly; Secure; SameSite=Strict</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Arquitectura</span>
            <h2 className="h2">Tres zonas de confianza, tres patrones</h2>
            <p className="lead">La frontera la impone el servidor con middleware y pruebas, no una convención del equipo.</p>
          </div>
          <div className="grid grid--3">
            {zonas.map((z) => (
              <article key={z.tipo} className="card zone-card" data-zona={z.tipo}>
                <Zona tipo={z.tipo} />
                <h3 className="h3">{z.titulo}</h3>
                <p className="muted small">{z.texto}</p>
                <dl className="kv">
                  <dt>Rutas</dt><dd>{z.rutas}</dd>
                  <dt>Caché</dt><dd>{z.cache}</dd>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Controles</span>
            <h2 className="h2">Seguridad medible</h2>
          </div>
          <div className="metrics">
            {metricas.map((m) => (
              <div key={m.texto} className="metric">
                <span className="metric__value">{m.valor}</span>
                <span className="metric__label">{m.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div style={{ display: 'grid', gap: 8 }}>
              <h2 className="h2">Pruebe la zona privada</h2>
              <p className="muted">Usuario <code>ana</code> · clave <code>Ana2026*</code> · OTP <code>123456</code></p>
            </div>
            <Link href="/login" className="btn btn--primary btn--lg">
              Ingresar <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
