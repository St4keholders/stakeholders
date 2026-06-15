"use client";

import { waUrl } from "@/lib/whatsapp";

interface WhatsAppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  message?: string;
  children: React.ReactNode;
}

export default function WhatsAppLink({ message = "Hola 👋 Quiero más información sobre Nexo.", children, className = "", ...props }: WhatsAppLinkProps) {
  return (
    <a
      href={waUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`wa-link ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
