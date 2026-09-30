import Link from 'next/link';

export function Marca() {
  return (
    <Link href="/" className="brand" aria-label="Banco Andino Digital, inicio">
      <svg className="brand__mark" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="7" fill="var(--accent)" />
        <path d="M7 19.5 12 9l3.5 7 2-3.5 3.5 7" fill="none" stroke="var(--accent-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        Banco Andino <span className="brand__sub">Digital</span>
      </span>
    </Link>
  );
}
