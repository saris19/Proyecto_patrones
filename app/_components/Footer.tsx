import { Zona } from './Zona';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>Banco Andino Digital es una entidad ficticia · Caso de estudio de patrones de rendering</p>
        <div className="footer__legend" aria-label="Leyenda de zonas">
          <Zona tipo="publica" />
          <Zona tipo="semi" />
          <Zona tipo="privada" />
        </div>
      </div>
    </footer>
  );
}
