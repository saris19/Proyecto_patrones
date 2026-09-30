/** Set pequeño de íconos de trazo (24px, stroke 1.75) para mantener consistencia. */
const trazos = {
  escudo: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z M9 12l2 2 4-4',
  candado: 'M6.5 10.5h11v9h-11z M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5',
  rayo: 'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2',
  tarjeta: 'M3.5 6.5h17v11h-17z M3.5 10h17 M7 14.5h4',
  alcancia: 'M4 11.5a6.5 5.5 0 0 1 13 0V16H15v2.5h-2V16H8v2.5H6V16.5A5.5 5.5 0 0 1 4 11.5Z M17 10.5h2.5v3H17 M9 7.5h4',
  grafica: 'M4 19.5h16 M7 16v-5 M11.5 16V8 M16 16v-7',
  documento: 'M7 3.5h7l4 4v13H7z M14 3.5v4h4 M9.5 12h6 M9.5 15.5h6',
  flecha: 'M5 12h14 M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alerta: 'M12 4 2.8 19.5h18.4L12 4Z M12 10v4.5 M12 17.2v.1',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 11v5.5 M12 7.8v.1',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  salir: 'M14 4.5h5v15h-5 M10 8l-4 4 4 4 M6 12h10',
  transferir: 'M4 8.5h14 M14 4.5l4 4-4 4 M20 15.5H6 M10 11.5l-4 4 4 4',
  servidor: 'M4.5 4.5h15v6h-15z M4.5 13.5h15v6h-15z M8 7.5h.01 M8 16.5h.01',
} as const;

export type NombreIcono = keyof typeof trazos;

export function Icono({ nombre, size = 20, titulo }: { nombre: NombreIcono; size?: number; titulo?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
    >
      {titulo && <title>{titulo}</title>}
      <path d={trazos[nombre]} />
    </svg>
  );
}
