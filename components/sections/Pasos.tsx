import Reveal from "@/components/ui/Reveal";
import NeuralCanvas from "@/components/fx/NeuralCanvas";

export default function Pasos() {
  return (
    <section className="proceso" id="proceso" data-fx>
      <NeuralCanvas />
      <div className="container">
        <Reveal className="section-header" delayClass="">
          <div className="section-eyebrow">Cómo se instala</div>
          <h2 className="section-title">De cero a un <em>ecosistema inteligente</em>,<br/>en tres pasos.</h2>
        </Reveal>

        <div className="steps">
          <Reveal delayClass="d1" className="step-item">
            <div className="step-num">PASO 01</div>
            <div className="step-name">Diagnóstico</div>
            <div className="step-meta">30 min · Gratis</div>
            <p className="step-desc">
              Analizamos tu flujo de ventas actual: cuántos mensajes recibes, cuántos respondes
              a tiempo y cuánto te está costando la diferencia.
            </p>
          </Reveal>
          
          <Reveal delayClass="d2" className="step-item">
            <div className="step-num">PASO 02</div>
            <div className="step-name">Instalación</div>
            <div className="step-meta">7 días</div>
            <p className="step-desc">
              Construimos tu punto de venta virtual, entrenamos al asistente con tu catálogo
              y tu tono, y conectamos tus canales. Todo listo en una semana.
            </p>
          </Reveal>
          
          <Reveal delayClass="d3" className="step-item">
            <div className="step-num">PASO 03</div>
            <div className="step-name">Operación</div>
            <div className="step-meta">Mensual</div>
            <p className="step-desc">
              El ecosistema atiende y vende. Tú revisas el panel, recibes los contactos
              listos para cerrar y nosotros optimizamos cada semana.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
