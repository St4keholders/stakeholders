"use client";

import { useScrolled } from "@/hooks/useScrolled";
import WhatsAppLink from "@/components/ui/WhatsAppLink";

export default function Header() {
  const scrolled = useScrolled(40);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="siteHeader">
      <a className="brand" href="#inicio">STAKEHOLDERS</a>
      <nav className="nav">
        <a href="#inicio">Inicio</a>
        <a href="#nexo">Nexo</a>
        <WhatsAppLink
          className="nav-cta"
          message="Hola 👋 Quiero agendar mi consulta gratuita de Nexo."
        >
          Agendar consulta
        </WhatsAppLink>
      </nav>
    </header>
  );
}
