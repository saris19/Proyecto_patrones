export type TipoZona = 'publica' | 'semi' | 'privada';

const etiquetas: Record<TipoZona, { nombre: string; patron: string }> = {
  publica: { nombre: 'Zona pública', patron: 'SSG' },
  semi: { nombre: 'Zona semipública', patron: 'ISR' },
  privada: { nombre: 'Zona privada', patron: 'SSR' },
};

/** Distintivo de zona: color + texto (nunca solo color). */
export function Zona({ tipo, detalle }: { tipo: TipoZona; detalle?: string }) {
  const e = etiquetas[tipo];
  return (
    <span className={`badge badge--${tipo}`}>
      <span className="badge__dot" aria-hidden />
      {e.nombre}
      <span className="mono">· {detalle ?? e.patron}</span>
    </span>
  );
}
