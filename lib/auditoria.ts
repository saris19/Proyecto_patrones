import 'server-only';

/** R5: registro de cada operación sensible. En producción: almacén inmutable (WORM/SIEM). */
export type Evento = {
  fecha: string;
  clienteId: string;
  accion: string;
  resultado: 'OK' | 'RECHAZADO';
  detalle?: string;
};

const g = globalThis as unknown as { __auditoria?: Evento[] };
const eventos = (g.__auditoria ??= []);

export function registrar(e: Omit<Evento, 'fecha'>) {
  const evento = { fecha: new Date().toISOString(), ...e };
  eventos.push(evento);
  console.log('[AUDITORIA]', JSON.stringify(evento));
}

export function eventosDe(clienteId: string, n = 5) {
  return eventos.filter((e) => e.clienteId === clienteId).slice(-n).reverse();
}
