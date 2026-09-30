import 'server-only';

/**
 * Simulación del core bancario. En un banco real esto es una API interna
 * a la que solo accede el servidor (BFF) con credenciales propias.
 */
export type Cuenta = { numero: string; tipo: 'Ahorros' | 'Corriente'; saldo: number };
export type Movimiento = { fecha: string; descripcion: string; valor: number };

type Cliente = { cuentas: Cuenta[]; movimientos: Movimiento[]; inscritas: string[] };

const g = globalThis as unknown as { __core?: Map<string, Cliente> };

const core = (g.__core ??= new Map<string, Cliente>([
  [
    'C-1001',
    {
      cuentas: [
        { numero: '0012004821', tipo: 'Ahorros', saldo: 8_450_300 },
        { numero: '0012009935', tipo: 'Corriente', saldo: 1_220_000 },
      ],
      movimientos: [
        { fecha: '2026-09-28', descripcion: 'Pago nómina', valor: 4_200_000 },
        { fecha: '2026-09-27', descripcion: 'Supermercado', valor: -186_400 },
        { fecha: '2026-09-25', descripcion: 'Servicios públicos', valor: -241_900 },
      ],
      inscritas: ['0045007710', '0045003302'],
    },
  ],
  [
    'C-1002',
    {
      cuentas: [{ numero: '0045007710', tipo: 'Ahorros', saldo: 2_310_750 }],
      movimientos: [
        { fecha: '2026-09-28', descripcion: 'Transferencia recibida', valor: 350_000 },
        { fecha: '2026-09-26', descripcion: 'Restaurante', valor: -92_000 },
      ],
      inscritas: ['0012004821'],
    },
  ],
]));

export async function obtenerCliente(clienteId: string) {
  const c = core.get(clienteId);
  if (!c) throw new Error('Cliente no encontrado');
  // Copia defensiva: nadie fuera del core muta el estado directamente
  return structuredClone(c);
}

export async function transferir(
  clienteId: string,
  origen: string,
  destino: string,
  valor: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = core.get(clienteId);
  if (!c) return { ok: false, error: 'Cliente no encontrado' };
  const cuenta = c.cuentas.find((x) => x.numero === origen);
  // R3: la autorización se verifica aquí, aunque la UI ya la haya "validado"
  if (!cuenta) return { ok: false, error: 'La cuenta de origen no pertenece al cliente' };
  if (!c.inscritas.includes(destino)) return { ok: false, error: 'La cuenta destino no está inscrita' };
  if (!Number.isInteger(valor) || valor <= 0) return { ok: false, error: 'Valor inválido' };
  if (valor > 5_000_000) return { ok: false, error: 'Supera el tope diario de $5.000.000' };
  if (valor > cuenta.saldo) return { ok: false, error: 'Saldo insuficiente' };

  cuenta.saldo -= valor;
  c.movimientos.unshift({
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: `Transferencia a ${enmascarar(destino)}`,
    valor: -valor,
  });
  for (const otro of core.values()) {
    const dest = otro.cuentas.find((x) => x.numero === destino);
    if (dest) {
      dest.saldo += valor;
      otro.movimientos.unshift({
        fecha: new Date().toISOString().slice(0, 10),
        descripcion: `Transferencia de ${enmascarar(origen)}`,
        valor,
      });
    }
  }
  return { ok: true };
}

/** Minimización (R1): la UI nunca recibe el número completo. */
export function enmascarar(numero: string) {
  return '****' + numero.slice(-4);
}

export const pesos = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
