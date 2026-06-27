# Panel Admin — Stakeholders / KC Asesorías

> Plan de implementación para Claude Code.
> Lee este archivo **completo** antes de tocar código.

---

## 0. Stack obligatorio

> ⚠️ **Importante:** este proyecto ya existe. Lo que vamos a construir es la sección `/admin` dentro del mismo repo. **No crees un proyecto nuevo, no inicialices Next.js de cero, no reinstales dependencias.** Solo agrega rutas, componentes y tablas.

- **Framework:** **Next.js 14+ con App Router** (carpeta `app/`).
  Todas las rutas del panel viven bajo `app/admin/...`.
  Usa **Server Components** por defecto y `"use client"` solo donde haya interactividad real (formularios, gráficos, modales).
- **Lenguaje:** **TypeScript** (`.tsx` / `.ts`).
- **Estilos:** **Tailwind CSS** (ya configurado en el repo). Sin CSS modules nuevos, sin styled-components.
- **UI:** **shadcn/ui ya está instalado** y se usa en el sitio público. Reúsalo en el admin para `Button`, `Input`, `Select`, `Dialog`, `Table`, `Tabs`, `Card`, `DropdownMenu`, `Toast`, `Calendar`, `Popover`. Si falta alguno, instálalo con `npx shadcn@latest add <componente>`.
- **Base de datos:** **Supabase** (postgres + auth + RLS).
  Cliente browser: `@supabase/ssr` con `createBrowserClient`.
  Cliente server: `@supabase/ssr` con `createServerClient` leyendo cookies.
- **Gráficos:** **Recharts**.
- **PDFs (cotizaciones):** `@react-pdf/renderer` con descarga directa (no `window.print()`).
- **Iconos:** **lucide-react** (ya viene con shadcn).
- **Tablas:** **@tanstack/react-table** para ordenamiento, filtros y paginación.
- **Formularios:** **react-hook-form + zod** para validación.
- **Fechas:** **date-fns** con locale `es`.
- **Estado servidor:** `@tanstack/react-query` opcional; si no, `revalidatePath` + Server Actions.

**No agregues:** Redux, Zustand, Prisma, Drizzle, tRPC, Sass. El stack ya está cerrado.

---

## 1. Arquitectura de rutas

```
app/
├── (public)/                      ← sitio actual (no tocar)
│   └── ...
└── admin/
    ├── layout.tsx                 ← layout con sidebar + topbar + auth guard
    ├── login/
    │   └── page.tsx               ← email + password (Supabase Auth)
    ├── page.tsx                   ← redirect a /admin/inicio
    ├── inicio/
    │   └── page.tsx               ← dashboard principal
    ├── citas/
    │   ├── page.tsx               ← listado + filtros
    │   └── [id]/page.tsx          ← detalle
    ├── leads/
    │   ├── page.tsx
    │   └── [id]/page.tsx          ← detalle con tabs: info / citas / cotizaciones
    ├── ventas/
    │   ├── page.tsx               ← listado de cotizaciones
    │   ├── nueva/page.tsx         ← form de creación
    │   └── [id]/
    │       ├── page.tsx           ← detalle + historial pagos
    │       └── pdf/route.ts       ← endpoint que sirve el PDF
    ├── compras/
    │   ├── page.tsx               ← listado de compras
    │   ├── nueva/page.tsx
    │   └── [id]/page.tsx
    ├── proveedores/
    │   ├── page.tsx
    │   └── [id]/page.tsx          ← detalle con tabs: info / compras
    ├── tesoreria/
    │   └── page.tsx               ← KPIs + listado de pendientes/vencidos
    ├── kpis/
    │   └── page.tsx               ← "Próximamente"
    └── usuarios/
        └── page.tsx               ← CRUD de vendedores (solo admin)
```

**Server Actions** van en `app/admin/_actions/<modulo>.ts`.
**Componentes compartidos del admin** en `app/admin/_components/`.
**Tipos generados de Supabase** en `lib/database.types.ts` (regenerar con `supabase gen types`).

---

## 2. Sistema de diseño

### 2.1 Tema dual (dark por defecto, light opcional)

El admin **arranca en dark**. Hay un toggle en el topbar que alterna `class="dark"` en `<html>` y persiste en `localStorage` (`admin-theme`). Lee el HTML base que acompaña este plan (`index-admin.html`) para ver el look exacto.

Configura `tailwind.config.ts` con `darkMode: 'class'` si no lo está, y define los tokens en `app/globals.css` con dos bloques: `:root` (light) y `.dark` (dark).

### 2.2 Tokens de color

```css
/* DARK (default) — heredado de index.html del sitio público */
--bg:           #050505;
--bg-raise:    #0a0a0b;       /* cards, sidebar */
--bg-elevated: #111114;        /* modales, popovers */
--fg:          #f5f5f0;
--fg-dim:      #6b6b66;
--fg-dim-2:    #44444a;
--line:        rgba(255,255,255,0.32);
--line-soft:   rgba(255,255,255,0.08);
--blue:        #4d7fff;        /* accent principal */
--blue-dim:    rgba(77,127,255,0.14);
--green:       #4ade80;        /* éxito / pagado */
--amber:       #fbbf24;        /* pendiente */
--red:         #f87171;        /* vencido / rechazado */

/* LIGHT — para el toggle. Inspirado en las capturas de KC Asesorías */
--bg:           #f4f6fb;
--bg-raise:    #ffffff;
--bg-elevated: #ffffff;
--fg:          #0e1b2c;
--fg-dim:      #5b6779;
--fg-dim-2:    #8c95a4;
--line:        rgba(14,27,44,0.12);
--line-soft:   rgba(14,27,44,0.06);
--blue:        #4d7fff;
--blue-dim:    rgba(77,127,255,0.10);
--green:       #16a34a;
--amber:       #d97706;
--red:         #dc2626;
```

### 2.3 Tipografía

Ya está cargada en el sitio público. Reúsala:

- **Display / títulos grandes:** `'Space Grotesk'`, peso 600, tracking `-0.045em`. Se usa para el saludo "Hola, Juan" y títulos de página.
- **Serif acento:** `'DM Serif Display'` solo para palabras en cursiva dentro de títulos (ej: "Compras y *gastos*"). Cárgala desde Google Fonts si no está.
- **Sans (cuerpo):** `'Inter'`, pesos 300/400/500/600.
- **Mono (etiquetas, eyebrows, números):** `'JetBrains Mono'`. Letter-spacing `0.22em`, uppercase para labels tipo "PRINCIPAL", "FINANZAS", "SISTEMA".

### 2.4 Layout

- **Sidebar fija** a la izquierda, ancho `240px`, fondo `--bg-raise`, borde derecho `1px solid --line-soft`. Logo arriba, secciones agrupadas por eyebrow mono (`PRINCIPAL`, `FINANZAS`, `SISTEMA`), perfil del usuario abajo con botón de logout.
- **Topbar** delgado dentro del contenido, con: breadcrumb mono ("— INICIO"), título Space Grotesk, descripción Inter dim, y a la derecha CTAs + toggle de tema.
- **Cards** con `border: 1px solid --line-soft`, `border-radius: 14px`, padding `1.5rem`. Sin sombras pesadas. Hover sutil: `border-color: --line`.
- **Tablas** sin bordes verticales, separadores horizontales muy tenues (`--line-soft`), header en mono uppercase tracking ancho.
- **KPI cards** del dashboard: número grande en Space Grotesk (font-size `2rem`, weight 600), label arriba en mono uppercase pequeño, ícono en esquina con fondo `--blue-dim` y color `--blue`, footnote abajo con flecha verde/roja + delta vs mes anterior.
- **Botones primarios:** fondo `--blue`, texto blanco, radius `8px`, padding `0.6rem 1.1rem`.
- **Botones secundarios:** fondo transparente, border `--line`, texto `--fg`.
- **Estados (badges):** pill con border, sin fondo (o fondo *-dim al 14%). `pagado/aceptada` = verde, `pendiente/enviada` = ámbar, `vencido/rechazada` = rojo.

### 2.5 Mobile

Sidebar colapsa a drawer con botón hamburguesa en el topbar. Todas las tablas se vuelven listas de cards en `<md`. Esto **no es opcional**, hazlo desde el principio.

---

## 3. Modelo de datos

Está todo en `supabase_schema.sql` (archivo hermano). Resumen:

| Tabla | Para qué |
|---|---|
| `usuarios` | Perfil ligado a `auth.users`. Campos: `role` (`admin`\|`vendedor`), `nombre`, `activo`. |
| `consultas` | Ya existe. Renombrada lógicamente a "citas". Trigger crea/actualiza un `lead` automáticamente. |
| `leads` | Datos del prospecto, incluye datos fiscales (NIT/CC, razón social, dirección) editables. |
| `proveedores` | Espejo de leads para compras. NIT, razón social, contacto, categoría. |
| `cotizaciones` | Header. Numeración `SH-AAAA-NNNN`. `total`, `monto_pagado`, `estado`. |
| `cotizacion_items` | Líneas con cantidad, precio, descuento, IVA. |
| `pagos_cotizaciones` | Pagos parciales del cliente. Trigger marca `pagada` cuando suma = total. |
| `compras` | Header. Numeración `C-AAAA-NNNN`. Misma estructura que cotizaciones pero de salida. |
| `compra_items` | Líneas de la compra. |
| `pagos_compras` | Pagos parciales hechos al proveedor. Trigger marca `pagada` cuando suma = total. |

---

## 4. Reglas de negocio críticas

### 4.1 Cita → Lead automático (deduplicado)

Cuando se inserta en `consultas` (mesa pública del sitio), un trigger:

1. Busca un lead existente por **email** (case-insensitive) **o** teléfono normalizado (solo dígitos).
2. Si existe: actualiza `ultima_cita_at`, incrementa `total_citas`, NO sobreescribe nombre/email si el lead ya los tiene.
3. Si no existe: crea un lead nuevo con los datos de la cita.
4. Guarda `lead_id` en la cita.

Esto está implementado en el SQL como función + trigger.

### 4.2 Auto-marcado de pagada

Trigger `AFTER INSERT OR UPDATE OR DELETE` en `pagos_cotizaciones`:

- Recalcula `monto_pagado = SUM(pagos.monto)` en la cotización.
- Si `monto_pagado >= total` y la cotización estaba en `aceptada` → pasa a `pagada` y setea `pagada_at = now()`.
- Si baja de total (se borró un pago) → vuelve a `aceptada`.

Mismo trigger en `pagos_compras` → `compras`.

### 4.3 Numeración correlativa

Función `next_cotizacion_numero(year)` y `next_compra_numero(year)` con lock (`SELECT ... FOR UPDATE`) para evitar race conditions. Formato: `SH-2026-0001`, `C-2026-0001`.

### 4.4 Estados

**Cotización:** `borrador` → `enviada` → `aceptada` → `pagada` (auto) | `rechazada` | `vencida` (cron diario si pasa `valida_hasta`).
**Compra:** `pendiente` → `pagada` (auto cuando se completan pagos) | `anulada`.
**Cita:** `pendiente` → `atendida` | `cancelada` | `no_asistio`.

---

## 5. Módulos — qué construir

### 5.1 `/admin/inicio` — Dashboard

**KPI cards (4, fila superior):**
1. Total Leads (count `leads`) + delta % vs mes anterior.
2. Ingresos del mes (suma de `pagos_cotizaciones` del mes).
3. Citas para hoy (count `consultas` con `fecha_consulta = today` y `estado != cancelada`).
4. Costos del mes (suma de `pagos_compras` del mes).

**Gráfico principal (ocupa 2/3 del ancho):**
Recharts `LineChart` o `ComposedChart` con **2 series**:
- Línea verde: ingresos diarios (suma `pagos_cotizaciones.monto` agrupado por día) últimos 30 días.
- Línea roja: costos diarios (suma `pagos_compras.monto` agrupado por día) últimos 30 días.
- Eje X: días 1–30 del mes en curso. Eje Y: pesos colombianos formateados `$XXk` / `$XXM`.
- Tooltip con valores exactos. Leyenda abajo.

**Calendario del mes (1/3 del ancho):**
Muestra el mes actual con badges en los días que tienen citas. Click en día → filtra `/admin/citas?fecha=YYYY-MM-DD`.

**Listado lateral:**
- Top 5 cotizaciones del mes (por monto).
- Top 5 compras del mes (por monto).

### 5.2 `/admin/citas`

Tabla con: fecha, hora, nombre, email, teléfono, estado, lead vinculado, acciones.
Filtros: rango de fechas, estado, búsqueda por nombre/email/teléfono.
Acción: cambiar estado, abrir lead vinculado.
Botón "Nueva cita" → modal con form (los mismos campos del sitio público + selector de lead existente opcional).

### 5.3 `/admin/leads`

Tabla con: nombre, email, teléfono, total_citas, ultima_cita, total_cotizaciones, estado, acciones.
Filtros: estado, con/sin cotización, búsqueda.

**Detalle `/admin/leads/[id]`** con 3 tabs:
- **Info:** form editable con datos personales **y datos fiscales** (NIT/CC, tipo_documento, razón_social, dirección, ciudad, departamento). Estos datos se piden al momento de cotizar pero se guardan en el lead.
- **Citas:** tabla de todas las citas de este lead.
- **Cotizaciones:** tabla de cotizaciones emitidas + botón "Nueva cotización para este lead".

### 5.4 `/admin/ventas` (Cotizaciones)

Tabla: número, fecha, lead, total, pagado, saldo, estado, validez, acciones.
Filtros: estado, rango de fechas, lead.
KPIs arriba (4 cards): total cotizado mes, total aceptado mes, total pagado mes, % conversión.

**`/admin/ventas/nueva`:**
- Step 1: seleccionar lead (autocomplete) o crear uno nuevo desde aquí.
- Step 2: si el lead no tiene datos fiscales completos → modal "Falta info fiscal del cliente. Completar." (campos: NIT/CC, razón social, dirección).
- Step 3: agregar items (cantidad, descripción, precio unitario, descuento %, IVA % por defecto 19).
- Step 4: validez (default 15 días), notas, condiciones.
- Submit → genera número `SH-2026-NNNN`, estado `borrador`.

**`/admin/ventas/[id]`:**
- Preview de la cotización.
- Botones: editar, enviar (cambia a `enviada` + permite descargar PDF), marcar aceptada/rechazada, **registrar pago**, descargar PDF.
- Historial de pagos abajo (tabla con fecha, monto, método, notas).
- Cuando suma de pagos = total → badge "PAGADA" automático.

**PDF (`/admin/ventas/[id]/pdf`):**
Endpoint API que devuelve el PDF con `@react-pdf/renderer`. Diseño:

- **Encabezado:** logo Stakeholders + datos del emisor (hardcoded):
  ```
  Stakeholders
  NIT: 1004011582-8
  stakeholdersadm@gmail.com
  3025219775
  ```
- **Datos del cliente:** desde el lead (razón social, NIT/CC, dirección, email, teléfono).
- **Número y fecha:** `SH-2026-NNNN`, fecha emisión, válida hasta.
- **Tabla de items:** cant, descripción, precio unit, descuento, subtotal.
- **Totales:** subtotal, descuento total, IVA, **total**.
- **Notas / condiciones** abajo.
- **Estilo:** light (fondo blanco), serif para el título "COTIZACIÓN" (DM Serif Display), Inter para todo lo demás. Color de acento: `#4d7fff`. Aunque el admin sea dark, el PDF siempre es light.

### 5.5 `/admin/compras`

Layout idéntico al de la imagen 2 que pasó el usuario, pero en dark.

Tabla: factura/doc, fecha, proveedor, centro de costo (opcional, puede ser null si no usan), total, estado, acciones.
KPIs arriba: total compras mes, total IVA mes, total retenciones mes, total pendiente por pagar.
Filtros: rango de fechas, proveedor, estado, buscador.

**Nueva compra:**
- Seleccionar proveedor (autocomplete o crear nuevo).
- Número de factura del proveedor (campo `ref_externa`).
- Items (cant, desc, precio, IVA, retención).
- Subir archivo de factura (Supabase Storage, bucket `facturas-compras`).
- Genera número interno `C-2026-NNNN`.

**Detalle:** igual que ventas pero del lado compras. Historial de pagos hechos al proveedor.

### 5.6 `/admin/proveedores`

Espejo de leads.
Tabla: razón social, NIT, contacto, email, teléfono, categoría, total compras, total pagado, saldo.
Detalle con tabs: **Info** (CRUD completo de datos fiscales) y **Compras** (tabla de compras hechas a este proveedor).

### 5.7 `/admin/tesoreria` — Conciliación + tiempos

Esta es la pantalla nueva.

**4 KPI cards arriba:**
1. **DSO** (Days Sales Outstanding): promedio de días entre `cotizacion.aceptada_at` y `pagada_at` (solo cotizaciones pagadas en los últimos 90 días).
2. **DPO** (Days Payable Outstanding): promedio de días entre `compra.created_at` y `pagada_at` (solo compras pagadas en los últimos 90 días).
3. **Por cobrar total:** suma de `cotizaciones.total - monto_pagado` donde estado ∈ {`aceptada`}.
4. **Por pagar total:** suma de `compras.total - monto_pagado` donde estado ∈ {`pendiente`}.

**Aging (2 tablas lado a lado):**
- **Cuentas por cobrar por antigüedad:** buckets `0-30 / 31-60 / 61-90 / +90 días` calculados desde `aceptada_at`. Cada bucket muestra cantidad de cotizaciones y monto total.
- **Cuentas por pagar por antigüedad:** mismo bucket pero desde `created_at` de compras pendientes.

**Listado de próximos cobros (debajo de los KPIs):**
Tabla unificada con TODAS las cotizaciones en `aceptada` que tienen saldo > 0, ordenadas por fecha de vencimiento (si no hay, por `aceptada_at`).
Columnas: número, cliente, total, pagado, **saldo**, días desde aceptación, **estado de antigüedad** (badge verde si <30d, ámbar 30-60d, rojo >60d).

**Listado de próximos pagos a hacer:**
Tabla con todas las compras en `pendiente` con saldo > 0.
Columnas: número, proveedor, ref factura, total, pagado, saldo, días desde emisión, estado.

**Tabs o secciones** para alternar entre "Por cobrar" / "Por pagar" / "Vencidos" (>60 días).

### 5.8 `/admin/kpis`

Placeholder. Solo card centrada que diga "Próximamente" en Space Grotesk grande + texto dim explicativo abajo.

### 5.9 `/admin/usuarios`

Solo accesible para `role = admin` (chequeo en el layout, redirigir a `/admin/inicio` si vendedor).
Tabla: nombre, email, rol, activo, último login, acciones.
Crear: form que llama a una Server Action que usa el Supabase **Admin API** (`createUser` con service role key del lado servidor). NUNCA expongas la service role key al cliente.

---

## 6. Autenticación y autorización

- **Login:** `/admin/login` con email + password vía Supabase Auth (`signInWithPassword`).
- **Middleware:** `middleware.ts` en la raíz que protege todo `/admin/*` salvo `/admin/login`. Si no hay sesión → redirect a login.
- **Rol:** se lee desde la tabla `usuarios` (no de metadata de auth). En el layout server-component cargas `usuario` por `user.id` y lo pasas por contexto/props.
- **RLS:**
  - `usuarios`: el usuario lee su propio perfil; admin lee todo.
  - `leads`, `cotizaciones`, `compras`, `proveedores`, etc.: cualquier usuario autenticado lee/escribe (todos los admin/vendedor ven todo). El control fino lo hacemos en UI.
  - `consultas` (mesa pública): `INSERT` con `anon` permitido (para que el sitio público pueda crear citas). `SELECT/UPDATE/DELETE` solo autenticados.
- Logout: botón en el sidebar inferior llama a `supabase.auth.signOut()` y hace `router.refresh()`.

---

## 7. Convenciones de código

- Componentes: PascalCase, archivos `ComponentName.tsx`.
- Server Actions: en archivos `_actions/<modulo>.ts` con `"use server"` arriba.
- Cliente Supabase: factoría única en `lib/supabase/client.ts` (browser) y `lib/supabase/server.ts` (server).
- Tipos: generar con `npx supabase gen types typescript --project-id <id> > lib/database.types.ts`. **No escribir tipos a mano que tengan equivalente generado.**
- Formato moneda: helper `formatCOP(n: number)` que devuelve `$ 1.234.567` con separador de miles `.` y sin decimales (estándar Colombia).
- Formato fecha: helper `formatFecha(d: Date)` → `25 jun 2026` (lowercase mes corto, locale es).
- Manejo de errores en Server Actions: devuelve `{ ok: true, data }` o `{ ok: false, error: string }`. Nunca lances excepciones al cliente sin contexto.
- Toasts: usa `sonner` (ya viene con shadcn) para feedback de mutaciones.

---

## 8. Checklist de implementación (orden sugerido)

1. **SQL:** correr `supabase_schema.sql` en el dashboard de Supabase.
2. **Tipos:** regenerar `lib/database.types.ts`.
3. **Auth:** crear `/admin/login`, middleware, primer usuario admin (manual en SQL editor: `INSERT INTO usuarios (id, email, role, nombre) VALUES (...)` después de crearlo en Auth).
4. **Layout `/admin`:** sidebar + topbar + toggle dark/light + auth guard.
5. **Dashboard `/admin/inicio`:** KPI cards (con datos reales) + gráfico ingresos vs costos + calendario.
6. **Citas:** listado + detalle + cambio de estado.
7. **Leads:** listado + detalle 3-tabs + edición de datos fiscales.
8. **Proveedores:** listado + detalle 2-tabs.
9. **Compras:** listado (replica el screenshot de KC pero en dark) + nueva + detalle + registrar pagos.
10. **Ventas / Cotizaciones:** listado + nueva (wizard) + detalle + registrar pagos + PDF.
11. **Tesorería:** KPIs + aging + listados de pendientes/vencidos.
12. **Usuarios:** solo admin.
13. **KPIs:** placeholder "Próximamente".
14. **Mobile:** revisar todos los módulos en viewport <md, ajustar sidebar drawer y tablas-a-cards.
15. **Toggle de tema:** verificar que persiste y que el PDF siempre sale light.

---

## 9. Archivos de referencia

- **`index-admin.html`** — mockup visual estático del look exacto del admin. Tradúcelo a componentes Next.js + Tailwind. **No uses el HTML literal**, es solo referencia visual.
- **`supabase_schema.sql`** — esquema completo para correr de una sola vez en Supabase.

---

## 10. Cosas que NO hay que hacer

- ❌ No tocar el sitio público (`app/(public)/...` o como esté estructurado actualmente).
- ❌ No reescribir el `tailwind.config.ts` desde cero; solo agrega tokens si faltan.
- ❌ No instalar otra librería de UI; shadcn ya está.
- ❌ No hardcodear nombre/email/teléfono de leads o proveedores en código — todo viene de DB.
- ❌ No exponer la `SUPABASE_SERVICE_ROLE_KEY` al cliente. Va solo en Server Actions / Route Handlers.
- ❌ No uses `window.print()` para los PDFs. `@react-pdf/renderer`.
- ❌ No olvides el locale `es` en fechas y números.
