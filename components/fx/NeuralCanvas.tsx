"use client";

import { useEffect, useRef } from "react";

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const touchDevice = window.matchMedia('(hover: none)').matches;
    const pointer = { x: -99999, y: -99999, active: false };
    let lastPointerMove = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      lastPointerMove = performance.now();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    if (!touchDevice) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
    }

    const sec = canvas.parentElement;
    if (!sec) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LINK_DIST = 110;
    const MOUSE_RADIUS = 240;

    let sys = {
      w: 0, h: 0,
      nodes: [] as any[],
      visible: false,
      phase: Math.random() * Math.PI * 2
    };

    const resize = () => {
      const r = sec.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sys.w = r.width;
      sys.h = r.height;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(26, Math.min(85, Math.round((r.width * r.height) / 17000)));
      sys.nodes = Array.from({ length: count }, () => ({
        x: Math.random() * sys.w,
        y: Math.random() * sys.h,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: 1 + Math.random() * 1.3
      }));
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('load', resize);

    const fxObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.target === sec) {
          sys.visible = e.isIntersecting;
        }
      });
    }, { threshold: 0 });
    fxObserver.observe(sec);

    let animationFrameId: number;

    const drawSystem = (now: number) => {
      const rect = sec.getBoundingClientRect();
      let mx = pointer.x - rect.left;
      let my = pointer.y - rect.top;
      let inside = pointer.active &&
        mx >= -MOUSE_RADIUS && mx <= sys.w + MOUSE_RADIUS &&
        my >= -MOUSE_RADIUS && my <= sys.h + MOUSE_RADIUS;

      const usePointer = !touchDevice && inside && (now - lastPointerMove) < 2500;
      if (!usePointer) {
        mx = sys.w * (0.5 + 0.36 * Math.sin(now * 0.00042 + sys.phase));
        my = sys.h * (0.5 + 0.36 * Math.sin(now * 0.00031 + sys.phase * 1.7));
        inside = true;
      }

      const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
      const baseColor = isLight ? '59, 102, 223' : '255, 255, 255';

      ctx.clearRect(0, 0, sys.w, sys.h);

      if (inside) {
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS * 1.35);
        if (isLight) {
          halo.addColorStop(0, 'rgba(59, 102, 223, 0.045)');
          halo.addColorStop(0.35, 'rgba(59, 102, 223, 0.02)');
          halo.addColorStop(0.7, 'rgba(59, 102, 223, 0.006)');
          halo.addColorStop(1, 'rgba(59, 102, 223, 0)');
        } else {
          halo.addColorStop(0, 'rgba(255,255,255,0.085)');
          halo.addColorStop(0.35, 'rgba(255,255,255,0.035)');
          halo.addColorStop(0.7, 'rgba(255,255,255,0.012)');
          halo.addColorStop(1, 'rgba(255,255,255,0)');
        }
        ctx.fillStyle = halo;
        ctx.fillRect(mx - MOUSE_RADIUS * 1.35, my - MOUSE_RADIUS * 1.35, MOUSE_RADIUS * 2.7, MOUSE_RADIUS * 2.7);
      }

      for (const n of sys.nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > sys.w) n.vx *= -1;
        if (n.y < 0 || n.y > sys.h) n.vy *= -1;
      }

      for (let i = 0; i < sys.nodes.length; i++) {
        const a = sys.nodes[i];
        const da = inside ? Math.hypot(a.x - mx, a.y - my) : Infinity;
        const heatA = Math.max(0, 1 - da / MOUSE_RADIUS);

        for (let j = i + 1; j < sys.nodes.length; j++) {
          const b = sys.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const db = inside ? Math.hypot(b.x - mx, b.y - my) : Infinity;
            const heat = Math.max(heatA, Math.max(0, 1 - db / MOUSE_RADIUS));
            const fade = 1 - Math.sqrt(d2) / LINK_DIST;
            const o = (0.022 + heat * 0.34) * fade;
            if (o > 0.006) {
              ctx.strokeStyle = `rgba(${baseColor},${isLight ? o * 0.4 : o})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = `rgba(${baseColor},${isLight ? 0.07 + heatA * 0.4 : 0.09 + heatA * 0.72})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + heatA * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const fxFrame = (now: number) => {
      if (sys.visible) {
        drawSystem(now);
      }
      animationFrameId = requestAnimationFrame(fxFrame);
    };
    animationFrameId = requestAnimationFrame(fxFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('load', resize);
      fxObserver.unobserve(sec);
      if (!touchDevice) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true"></canvas>;
}
