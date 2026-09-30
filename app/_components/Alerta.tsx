import { Icono } from './Icono';

export function Alerta({ tipo, titulo, children }: { tipo: 'ok' | 'err' | 'info'; titulo: string; children?: React.ReactNode }) {
  return (
    <div className={`alert alert--${tipo}`} role={tipo === 'err' ? 'alert' : 'status'}>
      <Icono nombre={tipo === 'ok' ? 'check' : tipo === 'err' ? 'alerta' : 'info'} size={18} />
      <div>
        <strong>{titulo}</strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
