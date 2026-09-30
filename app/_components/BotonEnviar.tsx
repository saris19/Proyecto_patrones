'use client';

import { useFormStatus } from 'react-dom';

/** Botón con estado de carga: evita doble envío y da retroalimentación inmediata. */
export function BotonEnviar({ children, pendiente }: { children: React.ReactNode; pendiente: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending} aria-live="polite">
      {pending ? (
        <>
          <span className="spinner" aria-hidden /> {pendiente}
        </>
      ) : (
        children
      )}
    </button>
  );
}
