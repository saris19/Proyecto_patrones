'use server';

import { redirect } from 'next/navigation';
import { exigirSesion } from '@/lib/sesion-actual';
import { obtenerCliente, transferir } from '@/lib/core';
import { registrar } from '@/lib/auditoria';

const OTP_DEMO = '123456'; // en producción: OTP por app/SMS ligado a la operación

/**
 * Operación transaccional crítica como Server Action.
 * Next.js ya compara Origin vs Host en las Server Actions (anti-CSRF);
 * además se revalida TODO en el servidor: sesión, propiedad de la cuenta,
 * destino inscrito, monto y segundo factor.
 */
export async function ejecutarTransferencia(form: FormData) {
  const sesion = await exigirSesion();
  const origen = String(form.get('origen') ?? '');
  const destino = String(form.get('destino') ?? '');
  const valor = Number(form.get('valor'));
  const otp = String(form.get('otp') ?? '');

  // Los <select> muestran números enmascarados; se resuelven contra el core en servidor
  const cliente = await obtenerCliente(sesion.clienteId);
  const cuentaOrigen = cliente.cuentas.find((c) => c.numero.endsWith(origen));
  const cuentaDestino = cliente.inscritas.find((n) => n.endsWith(destino));

  if (otp !== OTP_DEMO) {
    registrar({ clienteId: sesion.clienteId, accion: 'TRANSFERENCIA', resultado: 'RECHAZADO', detalle: 'OTP inválido' });
    redirect('/transferir?error=' + encodeURIComponent('Código de verificación inválido'));
  }

  const r = await transferir(sesion.clienteId, cuentaOrigen?.numero ?? '', cuentaDestino ?? '', valor);
  registrar({
    clienteId: sesion.clienteId,
    accion: 'TRANSFERENCIA',
    resultado: r.ok ? 'OK' : 'RECHAZADO',
    detalle: r.ok ? `valor=${valor}` : r.error,
  });
  if (!r.ok) redirect('/transferir?error=' + encodeURIComponent(r.error));
  redirect('/transferir?ok=1');
}
