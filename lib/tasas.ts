import 'server-only';

/**
 * Datos PÚBLICOS que cambian durante el día (tasas, TRM).
 * Son iguales para todos los visitantes: por eso pueden ir con ISR.
 */
export type Tasa = { producto: string; tasaEA: number };

export async function obtenerTasas() {
  // Simula una variación pequeña para que se note cada regeneración
  const ruido = () => Math.round((Math.random() - 0.5) * 10) / 100;
  const tasas: Tasa[] = [
    { producto: 'Crédito de libre inversión', tasaEA: 22.4 + ruido() },
    { producto: 'Crédito de vivienda (pesos)', tasaEA: 12.9 + ruido() },
    { producto: 'CDT a 360 días', tasaEA: 9.8 + ruido() },
    { producto: 'Cuenta de ahorros', tasaEA: 1.5 },
  ];
  const trm = 4000 + Math.round(Math.random() * 20000) / 100;
  return { tasas, trm, generadoEn: new Date().toISOString() };
}
