"use client";

import { useHeroScrollTrigger } from "@/hooks/useHeroScrollTrigger";
import NeuralCanvas from "@/components/fx/NeuralCanvas";

export default function Hero() {
  const { videoRef, triggered, playing, triggerPlay } = useHeroScrollTrigger();

  return (
    <section className="hero" id="inicio" data-fx>
      <NeuralCanvas />
      <video
        ref={videoRef}
        className={`hero-video ${playing ? 'playing' : ''}`}
        id="heroVideo"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src="https://kedrau7eenlfmyk0.public.blob.vercel-storage.com/portada%20inicial.mp4" type="video/mp4" />
      </video>

      <div className="video-mask"></div>

      <div className="overlay">
        <div className="hero-center">
          <div className="eyebrow">Stakeholders presenta · <b>Nexo</b></div>
          <h1 className="hero-title">
            Un <em>ecosistema inteligente</em><br className="line" />de ventas para tus clientes.
          </h1>
          <p className="hero-sub">
            Nexo conecta tu sitio web, tu asistente virtual y tus métricas de negocio
            en un solo ecosistema que te permite operar en todos tus canales de venta
            de manera omnipresente, dando un servicio de alta calidad.
          </p>
        </div>

        <div className={`bottom-cta ${triggered ? 'dismissed' : ''}`} id="bottomCta" onClick={triggerPlay}>
          <div className="cta-text">Desliza para iniciar</div>
          <div className="cta-arrow"></div>
        </div>
      </div>
    </section>
  );
}
