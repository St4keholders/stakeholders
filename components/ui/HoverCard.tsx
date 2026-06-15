"use client";

import { useEffect, useRef } from "react";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function HoverCard({ children, className = "" }: HoverCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
      const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(e => e.target.classList.toggle('animate', e.isIntersecting));
      }, { threshold: 0.55 });
      
      cardObserver.observe(el);
      
      return () => {
        cardObserver.unobserve(el);
      };
    }
  }, []);

  return (
    <div ref={ref} className={`card ${className}`}>
      {children}
    </div>
  );
}
