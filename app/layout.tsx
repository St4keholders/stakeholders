import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Grain from "@/components/layout/Grain";
import ProgressBar from "@/components/layout/ProgressBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexo — Stakeholders · Un ecosistema inteligente de ventas",
  description: "Nexo, el ecosistema inteligente de ventas de Stakeholders: sitio web, asistente virtual y métricas de negocio operando en todos tus canales. Agenda tu consulta gratuita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ProgressBar />
        <Grain />
        {children}
      </body>
    </html>
  );
}
