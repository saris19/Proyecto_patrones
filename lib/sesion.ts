import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Almacén de sesiones del lado del servidor (patrón BFF).
 * El navegador solo recibe un identificador opaco en una cookie HttpOnly;
 * nunca recibe tokens del core bancario.
 * En producción esto iría en Redis o similar; aquí vive en memoria.
 */
export const NOMBRE_COOKIE = '__Host-sid';
export const INACTIVIDAD_MS = 5 * 60 * 1000; // R4: 5 minutos

export type Sesion = {
  id: string;
  clienteId: string;
  nombre: string;
  creada: number;
  ultimaActividad: number;
};

type Usuario = { clienteId: string; nombre: string; sal: Buffer; hash: Buffer };

const g = globalThis as unknown as {
  __sesiones?: Map<string, Sesion>;
  __usuarios?: Map<string, Usuario>;
};

const sesiones = (g.__sesiones ??= new Map<string, Sesion>());

function crearUsuario(clienteId: string, nombre: string, clave: string): Usuario {
  const sal = randomBytes(16);
  return { clienteId, nombre, sal, hash: scryptSync(clave, sal, 32) };
}

// Usuarios de demostración (credenciales documentadas en el README)
const usuarios = (g.__usuarios ??= new Map<string, Usuario>([
  ['ana', crearUsuario('C-1001', 'Ana Martínez', 'Ana2026*')],
  ['luis', crearUsuario('C-1002', 'Luis Guerrero', 'Luis2026*')],
]));

export function autenticar(usuario: string, clave: string): Sesion | null {
  const u = usuarios.get(usuario.trim().toLowerCase());
  // Se calcula el hash aunque el usuario no exista para no filtrar por tiempo
  const sal = u?.sal ?? randomBytes(16);
  const hash = scryptSync(clave, sal, 32);
  if (!u || !timingSafeEqual(hash, u.hash)) return null;

  const ahora = Date.now();
  const sesion: Sesion = {
    id: randomBytes(32).toString('base64url'), // ID nuevo en cada login (anti fijación)
    clienteId: u.clienteId,
    nombre: u.nombre,
    creada: ahora,
    ultimaActividad: ahora,
  };
  sesiones.set(sesion.id, sesion);
  return sesion;
}

/** Valida la sesión en CADA petición (R3, R4) y renueva la actividad. */
export function validarSesion(id: string | undefined): Sesion | null {
  if (!id) return null;
  const s = sesiones.get(id);
  if (!s) return null;
  if (Date.now() - s.ultimaActividad > INACTIVIDAD_MS) {
    sesiones.delete(id);
    return null;
  }
  s.ultimaActividad = Date.now();
  return s;
}

export function cerrarSesion(id: string | undefined) {
  if (id) sesiones.delete(id);
}

/** Cierre global: elimina todas las sesiones de un cliente. */
export function cerrarTodas(clienteId: string) {
  for (const [id, s] of sesiones) if (s.clienteId === clienteId) sesiones.delete(id);
}

export const opcionesCookie = {
  httpOnly: true, // R2: JavaScript no puede leerla
  secure: true, // solo HTTPS (los navegadores aceptan localhost)
  sameSite: 'strict' as const,
  path: '/', // requisito del prefijo __Host-
  maxAge: 60 * 60, // tope absoluto; la inactividad se controla en servidor
};
