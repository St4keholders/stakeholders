# Proyecto: Nexo Landing — Stakeholders

## 🎯 Misión

Convertir el HTML existente en `_borrador/index.html` en un proyecto **Next.js modular y profesional**, manteniendo intacto **todo** el diseño, animaciones, comportamiento y copy original — **agregando además** persistencia del formulario de consulta en una base de datos Supabase.

---

## 📍 Contexto del proyecto

- **Marca**: Stakeholders
- **Producto**: Nexo (ecosistema inteligente de ventas)
- **Idioma**: Español
- **Ubicación negocio**: Medellín, Colombia
- **CTA principal**: WhatsApp al número `573181797287`

---

## 🛠️ Stack ya instalado

- **Next.js 16** con App Router
- **TypeScript** 
- **Turbopack** (dev server)
- **CSS tradicional** (NO usar Tailwind — el CSS ya está escrito en el HTML original)
- **`@supabase/supabase-js`** (ya en package.json)
- Sin `src/` directory: todo va en la raíz

---

## 📁 Archivos clave a leer ANTES de empezar

1. **`_borrador/index.html`** — el HTML original completo (~1830 líneas). Tiene CSS inline (~900 líneas) y JS inline (~700 líneas). **Esta es la fuente de verdad del diseño y comportamiento.** Léelo entero antes de tocar nada.
2. **`package.json`** — para verificar dependencias.
3. **`.env.local`** (ya existe) — contiene:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

---

## 🗄️ Base de datos Supabase

Ya está creada la tabla `public.consultas` con esta estructura:

```sql
id              uuid primary key (auto)
created_at      timestamptz (auto)
fecha_consulta  date           NOT NULL
hora_consulta   text           NOT NULL
telefono        text           NOT NULL
email           text           NOT NULL
estado          text           default 'pendiente'
```

**RLS activado**, con políticas:
- `INSERT`: permitido para `anon` y `authenticated` (cualquier visitante puede agendar).
- `SELECT`: solo `authenticated` (datos protegidos).

No tocar nada de la DB salvo agregar lecturas si fuera necesario.

---

## 🧱 Estructura objetivo de carpetas

```
stakeholders/
├── app/
│   ├── layout.tsx          ← fuentes, metadata, <html>, <body>, Grain, ProgressBar
│   ├── page.tsx            ← compone las secciones en orden
│   ├── globals.css         ← TODO el CSS del <style> original
│   └── favicon.ico
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          (client)
│   │   ├── Footer.tsx          (server)
│   │   ├── ProgressBar.tsx     (client)
│   │   └── Grain.tsx           (server)
│   │
│   ├── sections/
│   │   ├── Hero.tsx            (client — video + scroll trigger)
│   │   ├── NexoServicio.tsx    (server)
│   │   ├── Pasos.tsx           (server)
│   │   └── Consulta.tsx        (client — calendario + form)
│   │
│   ├── fx/
│   │   └── NeuralCanvas.tsx    (client — canvas animado)
│   │
│   ├── ui/
│   │   └── WhatsAppLink.tsx    (client)
│   │
│   └── svg/
│       ├── ChipBrain.tsx       (server)
│       ├── Vitrina.tsx         (server)
│       ├── AgenteIA.tsx        (server)
│       └── Panel.tsx           (server)
│
├── hooks/
│   ├── useHeroScrollTrigger.ts
│   ├── useCalendar.ts
│   └── useScrolled.ts
│
├── lib/
│   ├── supabase.ts             ← cliente Supabase
│   ├── whatsapp.ts             ← waUrl(msg), WA_NUMBER
│   └── dates.ts                ← DIAS, MESES, formatDate, validators
│
└── _borrador/index.html        ← solo lectura, referencia
```

---

## 🚫 Reglas estrictas

1. **NO modificar el diseño visual.** Colores, tipografías, espaciados, sombras, bordes, todo debe verse idéntico al original.
2. **NO cambiar el copy.** Ni una palabra. Si encuentras un texto, déjalo igual.
3. **NO cambiar comportamientos interactivos:**
   - Video con scroll-trigger en el Hero (bloqueo de scroll en móvil, auto-scroll a los 2.5s, fallbacks de seguridad).
   - Calendario interactivo (mes navegable, slots de hora, validación de día/hora/teléfono/email).
   - Efecto neuronal canvas en secciones con `data-fx`.
   - Hover de cards y reveal on scroll.
   - Header que cambia a `scrolled` con backdrop blur.
   - Progress bar superior que se llena con el video.
4. **Server vs Client Components**: marcar `"use client"` **SOLO** donde se necesita. Mantener el árbol de Server Components lo más amplio posible.
5. **Mover el CSS completo del `<style>` original a `app/globals.css`.** Mantener las clases (`.hero`, `.card`, `.cta-text`, etc.) **idénticas** para no romper estilos. Incluir todas las variables `:root`, reset, `html.locked`, `.grain`, media queries, `prefers-reduced-motion`, todo.
6. **Fuentes**: migrar de `<link>` de Google Fonts a `next/font/google` en `layout.tsx` (Inter, Space Grotesk, JetBrains Mono). Mapear cada fuente a su variable CSS (`--sans`, `--display`, `--mono`).
7. **Metadata**: mover `<title>` y `<meta description>` al objeto `metadata` exportado desde `layout.tsx`.
8. **NO subir el `.env.local` a Git.** Verificar que `.gitignore` ya lo ignora.

---

## ⚙️ Lógica clave: formulario de consulta

En `components/sections/Consulta.tsx`, cuando el usuario hace clic en **"Confirmar por WhatsApp"**:

```
1. Validar phone (>= 7 dígitos numéricos) y email (regex estándar). 
   Estas validaciones YA EXISTEN en el HTML original — replicarlas.
2. Llamar a:
       supabase
         .from('consultas')
         .insert({
           fecha_consulta: selectedDate.toISOString().split('T')[0],
           hora_consulta:  selectedSlot,
           telefono:       phone.trim(),
           email:          email.trim(),
         })
3. Si la inserción falla → log a consola, NO bloquear al usuario.
4. Inmediatamente después → abrir WhatsApp con el mensaje exacto del original:
   "Hola 👋 Quiero agendar mi consulta gratuita de Nexo para el {formatDate(date)} 
    a las {slot}.\n\nMis datos de contacto:\n📞 {phone}\n✉️ {email}"
```

El insert NO debe bloquear la apertura de WhatsApp. La experiencia es: clic → WhatsApp se abre, y en paralelo se guarda en DB.

---

## 🧰 Archivos `lib/` específicos

### `lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### `lib/whatsapp.ts`
```typescript
export const WA_NUMBER = '573181797287'

export const waUrl = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
```

### `lib/dates.ts`
Exportar `DIAS`, `MESES`, `formatDate(date)`, `validPhone(v)`, `validEmail(v)` extraídos del JS original.

---

## 📦 Tareas por fase (recomendación de ejecución)

### Fase 1 — Setup base
- Leer `_borrador/index.html` completo.
- Migrar el CSS del `<style>` a `app/globals.css` **literalmente**, sin refactor.
- Configurar fuentes con `next/font/google` en `layout.tsx`.
- Crear `metadata` con el `<title>` y description originales.
- Crear `lib/supabase.ts`, `lib/whatsapp.ts`, `lib/dates.ts`.

### Fase 2 — Layout
- `Header.tsx` (con hook `useScrolled` para clase `scrolled`).
- `Footer.tsx`.
- `Grain.tsx` y `ProgressBar.tsx`.
- Insertar Grain y ProgressBar en `layout.tsx` o `page.tsx` según corresponda.

### Fase 3 — Hero
- `Hero.tsx` con `<video>`, overlay, masks.
- Hook `useHeroScrollTrigger` con TODA la lógica:
  - Bloqueo `html.locked` solo en móvil.
  - Trigger del video al primer wheel/touch.
  - Auto-scroll a los 2.5s con easing.
  - Fallback de 3.5s por si el video no carga.
  - Manejo de `prefers-reduced-motion`.
- Conectar `ProgressBar` al timeupdate del video.

### Fase 4 — NexoServicio
- Sección con 3 cards (Punto de Venta Virtual, Asistente Virtual, Panel).
- Extraer los SVGs grandes a `components/svg/` (cada uno como componente).
- Reveal on scroll con IntersectionObserver (puede ir en un hook compartido).

### Fase 5 — Pasos
- Sección de 3 pasos (Diagnóstico, Instalación, Operación).
- Server component, sin estado.

### Fase 6 — Consulta
- Hook `useCalendar` con estado: `viewMonth`, `viewYear`, `selectedDate`, `selectedSlot`, `phone`, `email`.
- Render del grid de días con `useMemo` (no manipular DOM).
- Slots, inputs, mensaje de estado dinámico.
- Conectar el botón confirmar a Supabase + WhatsApp (ver "Lógica clave" arriba).

### Fase 7 — Efectos
- `NeuralCanvas.tsx` con `useRef` al canvas, `requestAnimationFrame` en `useEffect`, cleanup correcto.
- Variante automática para dispositivos táctiles (`window.matchMedia('(hover: none)')`).
- Insertar uno por cada sección que tenga `data-fx` en el original.

### Fase 8 — QA
- `npm run dev` arranca sin errores ni warnings críticos.
- Comparar visualmente con el original abriendo `_borrador/index.html` en el navegador.
- Probar flujo completo de la consulta: seleccionar día, hora, llenar datos, confirmar → verificar fila nueva en Supabase + WhatsApp abierto.
- Probar en mobile (DevTools responsive).
- Probar con `prefers-reduced-motion` activado.

---

## ✅ Criterios de aceptación

- [ ] `npm run dev` arranca sin errores.
- [ ] El sitio es visualmente **indistinguible** del `_borrador/index.html`.
- [ ] Todas las animaciones funcionan: video hero, calendario, neural canvas, reveals, hovers.
- [ ] Enviar un formulario crea un registro en la tabla `consultas` de Supabase **y** abre WhatsApp con el mensaje correcto.
- [ ] Si Supabase está caído, el WhatsApp se abre igual (no bloquear UX).
- [ ] Funciona bien en mobile y desktop.
- [ ] `prefers-reduced-motion` deshabilita animaciones.

---

## 💬 Comunicación

- Si encuentras ambigüedad en el original, **prioriza el comportamiento original** sobre cualquier "mejora".
- Si necesitas crear archivos no listados aquí, hazlo, pero mantén la lógica de carpetas.
- Si algo del HTML original no se puede traducir 1:1 a React (poco probable), explícalo antes de tomar atajos.

**Empieza leyendo `_borrador/index.html` completo y confirmando el plan antes de escribir código.**
