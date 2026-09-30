import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="container page" style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <span className="eyebrow mono">Error 404</span>
      <h1 className="h1">Esta página no existe</h1>
      <p className="lead">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Link href="/" className="btn btn--primary">Volver al inicio</Link>
    </div>
  );
}
