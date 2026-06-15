import ChipBrain from "@/components/svg/ChipBrain";
import Vitrina from "@/components/svg/Vitrina";
import AgenteIA from "@/components/svg/AgenteIA";
import Panel from "@/components/svg/Panel";
import Reveal from "@/components/ui/Reveal";
import HoverCard from "@/components/ui/HoverCard";
import NeuralCanvas from "@/components/fx/NeuralCanvas";

export default function NexoServicio() {
  return (
    <section className="servicio" id="nexo" data-fx>
      <NeuralCanvas />
      <div className="container">
        <Reveal className="section-header">
          <div className="nexo-mark">
            <div className="chip" aria-hidden="true">
              <ChipBrain />
            </div>
            <div className="nexo-id">
              <span className="nexo-name">NEXO</span>
              <span className="nexo-by">Servicio destacado · by <b>Stakeholders</b></span>
            </div>
          </div>

          <h2 className="section-title">Tres componentes.<br/>Un solo <em>ecosistema</em>.</h2>
          <p className="section-lead">
            La vitrina que vende, el asistente que responde y el panel que lo demuestra.
            Siempre se instalan juntos — por eso Nexo es un ecosistema inteligente y no
            servicios sueltos.
          </p>
        </Reveal>

        <div className="features">
          <Reveal delayClass="d1">
            <HoverCard>
              <div className="fig-label"><span>FIG 01</span><span>VITRINA</span></div>
              <div className="illustration">
                <Vitrina />
              </div>
              <h3 className="card-title">Punto de Venta Virtual</h3>
              <p className="card-text">
                Tu vitrina digital diseñada para una sola cosa: que el visitante compre tu
                servicio de manera directa. No es una página de presencia — es una página
                de venta, abierta los 365 días.
              </p>
            </HoverCard>
          </Reveal>

          <Reveal delayClass="d2">
            <HoverCard>
              <div className="fig-label"><span>FIG 02</span><span>AGENTE IA</span></div>
              <div className="illustration">
                <AgenteIA />
              </div>
              <h3 className="card-title">Asistente Virtual</h3>
              <p className="card-text">
                Un agente de IA que responde en segundos en tu web, WhatsApp e Instagram.
                Resuelve dudas, toma pedidos y agenda citas con el tono de tu marca —
                y separa curiosos de compradores antes de pasarte el contacto.
              </p>
            </HoverCard>
          </Reveal>

          <Reveal delayClass="d3">
            <HoverCard>
              <div className="fig-label"><span>FIG 03</span><span>RESULTADOS</span></div>
              <div className="illustration">
                <Panel />
              </div>
              <h3 className="card-title">Panel de Métricas</h3>
              <p className="card-text">
                Una sola pantalla donde ves cómo el sistema se ha desempeñado, semana
                a semana. Perfecto para dar seguimiento.
              </p>
            </HoverCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
