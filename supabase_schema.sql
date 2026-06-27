-- =====================================================================
-- STAKEHOLDERS / KC ASESORÍAS — Panel Admin
-- Schema completo para Supabase Postgres.
-- Ejecutar este archivo entero en el SQL Editor de Supabase.
-- Idempotente: se puede correr varias veces sin romper nada.
-- =====================================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. USUARIOS (perfil ligado a auth.users)
-- =====================================================================
create table if not exists public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  nombre      text not null,
  role        text not null default 'vendedor' check (role in ('admin','vendedor')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_usuarios_role on public.usuarios(role);

-- =====================================================================
-- 2. LEADS (clientes / prospectos)
-- =====================================================================
create table if not exists public.leads (
  id                  uuid primary key default uuid_generate_v4(),
  nombre              text,
  email               text,
  telefono            text,

  -- Datos fiscales (se llenan en una reunión posterior, antes de cotizar)
  tipo_documento      text check (tipo_documento in ('CC','NIT','CE','PP','TI')),
  numero_documento    text,
  razon_social        text,
  direccion           text,
  ciudad              text,
  departamento        text,

  -- Estado del lead en el pipeline
  estado              text not null default 'nuevo'
                       check (estado in ('nuevo','contactado','cotizado','ganado','perdido','frio')),
  origen              text default 'cita_web',  -- cita_web, manual, referido, ...
  notas               text,

  -- Métricas agregadas (mantenidas por triggers)
  total_citas         int  not null default 0,
  ultima_cita_at      timestamptz,
  total_cotizaciones  int  not null default 0,
  ultima_cotizacion_at timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_leads_email          on public.leads(lower(email));
create index if not exists idx_leads_telefono_norm  on public.leads(regexp_replace(coalesce(telefono,''),'\D','','g'));
create index if not exists idx_leads_estado         on public.leads(estado);

-- =====================================================================
-- 3. CONSULTAS / CITAS  (ya existe — la ajustamos)
-- =====================================================================
create table if not exists public.consultas (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  fecha_consulta  date not null,
  hora_consulta   text not null,
  telefono        text,
  email           text,
  estado          text not null default 'pendiente'
                   check (estado in ('pendiente','atendida','cancelada','no_asistio')),
  nombre          text
);

-- Columnas que sumamos (idempotente)
alter table public.consultas add column if not exists lead_id    uuid references public.leads(id) on delete set null;
alter table public.consultas add column if not exists notas      text;
alter table public.consultas add column if not exists atendida_por uuid references public.usuarios(id);

create index if not exists idx_consultas_fecha   on public.consultas(fecha_consulta);
create index if not exists idx_consultas_lead    on public.consultas(lead_id);
create index if not exists idx_consultas_estado  on public.consultas(estado);

-- =====================================================================
-- 4. PROVEEDORES (espejo de leads, lado compras)
-- =====================================================================
create table if not exists public.proveedores (
  id                uuid primary key default uuid_generate_v4(),
  razon_social      text not null,
  tipo_documento    text check (tipo_documento in ('CC','NIT','CE')),
  numero_documento  text,
  contacto_nombre   text,
  email             text,
  telefono          text,
  direccion         text,
  ciudad            text,
  departamento      text,
  categoria         text,
  activo            boolean not null default true,
  notas             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_proveedores_razon  on public.proveedores(lower(razon_social));
create index if not exists idx_proveedores_doc    on public.proveedores(numero_documento);

-- =====================================================================
-- 5. COTIZACIONES (ventas)
-- =====================================================================
create table if not exists public.cotizaciones (
  id              uuid primary key default uuid_generate_v4(),
  numero          text not null unique,   -- SH-2026-0001
  lead_id         uuid not null references public.leads(id) on delete restrict,
  vendedor_id     uuid references public.usuarios(id) on delete set null,

  fecha_emision   date not null default current_date,
  valida_hasta    date,

  subtotal        numeric(14,2) not null default 0,
  descuento_total numeric(14,2) not null default 0,
  iva_total       numeric(14,2) not null default 0,
  total           numeric(14,2) not null default 0,
  monto_pagado    numeric(14,2) not null default 0,   -- recalculado por trigger

  moneda          text not null default 'COP',

  estado          text not null default 'borrador'
                   check (estado in ('borrador','enviada','aceptada','pagada','rechazada','vencida')),

  -- Snapshot de datos fiscales del lead al momento de emitir (para el PDF)
  cliente_snapshot jsonb,

  notas           text,
  condiciones     text,

  enviada_at      timestamptz,
  aceptada_at     timestamptz,
  pagada_at       timestamptz,
  rechazada_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_cotizaciones_lead    on public.cotizaciones(lead_id);
create index if not exists idx_cotizaciones_estado  on public.cotizaciones(estado);
create index if not exists idx_cotizaciones_fecha   on public.cotizaciones(fecha_emision);

create table if not exists public.cotizacion_items (
  id              uuid primary key default uuid_generate_v4(),
  cotizacion_id   uuid not null references public.cotizaciones(id) on delete cascade,
  orden           int not null default 0,
  descripcion     text not null,
  cantidad        numeric(12,2) not null default 1,
  precio_unitario numeric(14,2) not null default 0,
  descuento_pct   numeric(5,2)  not null default 0,
  iva_pct         numeric(5,2)  not null default 19,
  subtotal        numeric(14,2) not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_cot_items_cot on public.cotizacion_items(cotizacion_id);

create table if not exists public.pagos_cotizaciones (
  id              uuid primary key default uuid_generate_v4(),
  cotizacion_id   uuid not null references public.cotizaciones(id) on delete cascade,
  fecha           date not null default current_date,
  monto           numeric(14,2) not null check (monto > 0),
  metodo          text check (metodo in ('efectivo','transferencia','tarjeta','cheque','otro')),
  referencia      text,
  notas           text,
  registrado_por  uuid references public.usuarios(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pagos_cot on public.pagos_cotizaciones(cotizacion_id);

-- =====================================================================
-- 6. COMPRAS (espejo de cotizaciones, lado salida)
-- =====================================================================
create table if not exists public.compras (
  id              uuid primary key default uuid_generate_v4(),
  numero          text not null unique,    -- C-2026-0001
  proveedor_id    uuid not null references public.proveedores(id) on delete restrict,
  registrado_por  uuid references public.usuarios(id) on delete set null,

  ref_externa     text,                    -- número de factura del proveedor
  fecha_factura   date not null default current_date,
  fecha_vencimiento date,

  subtotal        numeric(14,2) not null default 0,
  iva_total       numeric(14,2) not null default 0,
  retencion_total numeric(14,2) not null default 0,
  total           numeric(14,2) not null default 0,
  monto_pagado    numeric(14,2) not null default 0,  -- recalculado por trigger

  estado          text not null default 'pendiente'
                   check (estado in ('pendiente','pagada','anulada')),

  concepto        text,
  archivo_url     text,                    -- factura escaneada en Supabase Storage
  notas           text,

  pagada_at       timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_compras_proveedor on public.compras(proveedor_id);
create index if not exists idx_compras_estado    on public.compras(estado);
create index if not exists idx_compras_fecha     on public.compras(fecha_factura);

create table if not exists public.compra_items (
  id              uuid primary key default uuid_generate_v4(),
  compra_id       uuid not null references public.compras(id) on delete cascade,
  orden           int not null default 0,
  descripcion     text not null,
  cantidad        numeric(12,2) not null default 1,
  precio_unitario numeric(14,2) not null default 0,
  iva_pct         numeric(5,2)  not null default 19,
  retencion_pct   numeric(5,2)  not null default 0,
  subtotal        numeric(14,2) not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_compra_items_compra on public.compra_items(compra_id);

create table if not exists public.pagos_compras (
  id              uuid primary key default uuid_generate_v4(),
  compra_id       uuid not null references public.compras(id) on delete cascade,
  fecha           date not null default current_date,
  monto           numeric(14,2) not null check (monto > 0),
  metodo          text check (metodo in ('efectivo','transferencia','tarjeta','cheque','otro')),
  referencia      text,
  notas           text,
  registrado_por  uuid references public.usuarios(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pagos_compras on public.pagos_compras(compra_id);

-- =====================================================================
-- 7. FUNCIONES Y TRIGGERS
-- =====================================================================

-- 7.1 updated_at automático
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'usuarios','leads','proveedores','cotizaciones','compras'
  ])
  loop
    execute format('drop trigger if exists trg_%s_updated_at on public.%I;', t, t);
    execute format(
      'create trigger trg_%s_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at();', t, t);
  end loop;
end $$;

-- 7.2 Numeración correlativa SH-AAAA-NNNN / C-AAAA-NNNN
create or replace function public.next_correlativo(p_prefijo text, p_tabla text)
returns text language plpgsql as $$
declare
  v_year int := extract(year from current_date)::int;
  v_count int;
  v_pattern text;
begin
  v_pattern := p_prefijo || '-' || v_year || '-%';
  -- Lock conservador: contar lo que ya hay con ese prefijo + año
  execute format(
    'select count(*) from public.%I where numero like $1',
    p_tabla
  ) into v_count using v_pattern;
  return p_prefijo || '-' || v_year || '-' || lpad((v_count + 1)::text, 4, '0');
end $$;

-- Asignar número automáticamente si viene null
create or replace function public.tg_cotizacion_numero()
returns trigger language plpgsql as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := public.next_correlativo('SH', 'cotizaciones');
  end if;
  return new;
end $$;

drop trigger if exists trg_cotizacion_numero on public.cotizaciones;
create trigger trg_cotizacion_numero
  before insert on public.cotizaciones
  for each row execute function public.tg_cotizacion_numero();

create or replace function public.tg_compra_numero()
returns trigger language plpgsql as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := public.next_correlativo('C', 'compras');
  end if;
  return new;
end $$;

drop trigger if exists trg_compra_numero on public.compras;
create trigger trg_compra_numero
  before insert on public.compras
  for each row execute function public.tg_compra_numero();

-- 7.3 Recalcular monto_pagado y auto-marcar pagada (cotizaciones)
create or replace function public.tg_recalc_cotizacion_pago()
returns trigger language plpgsql as $$
declare
  v_cot_id    uuid;
  v_total     numeric(14,2);
  v_pagado    numeric(14,2);
  v_estado    text;
begin
  v_cot_id := coalesce(new.cotizacion_id, old.cotizacion_id);

  select coalesce(sum(monto),0) into v_pagado
    from public.pagos_cotizaciones where cotizacion_id = v_cot_id;

  select total, estado into v_total, v_estado
    from public.cotizaciones where id = v_cot_id;

  update public.cotizaciones
     set monto_pagado = v_pagado,
         estado = case
                    when v_pagado >= v_total and v_estado in ('aceptada','pagada') then 'pagada'
                    when v_pagado <  v_total and v_estado = 'pagada' then 'aceptada'
                    else v_estado
                  end,
         pagada_at = case
                       when v_pagado >= v_total and v_estado in ('aceptada','pagada')
                         then coalesce(pagada_at, now())
                       when v_pagado < v_total then null
                       else pagada_at
                     end
   where id = v_cot_id;

  return null;
end $$;

drop trigger if exists trg_recalc_cot_pago on public.pagos_cotizaciones;
create trigger trg_recalc_cot_pago
  after insert or update or delete on public.pagos_cotizaciones
  for each row execute function public.tg_recalc_cotizacion_pago();

-- 7.4 Recalcular monto_pagado y auto-marcar pagada (compras)
create or replace function public.tg_recalc_compra_pago()
returns trigger language plpgsql as $$
declare
  v_compra_id uuid;
  v_total     numeric(14,2);
  v_pagado    numeric(14,2);
  v_estado    text;
begin
  v_compra_id := coalesce(new.compra_id, old.compra_id);

  select coalesce(sum(monto),0) into v_pagado
    from public.pagos_compras where compra_id = v_compra_id;

  select total, estado into v_total, v_estado
    from public.compras where id = v_compra_id;

  update public.compras
     set monto_pagado = v_pagado,
         estado = case
                    when v_pagado >= v_total and v_estado in ('pendiente','pagada') then 'pagada'
                    when v_pagado <  v_total and v_estado = 'pagada' then 'pendiente'
                    else v_estado
                  end,
         pagada_at = case
                       when v_pagado >= v_total and v_estado in ('pendiente','pagada')
                         then coalesce(pagada_at, now())
                       when v_pagado < v_total then null
                       else pagada_at
                     end
   where id = v_compra_id;

  return null;
end $$;

drop trigger if exists trg_recalc_compra_pago on public.pagos_compras;
create trigger trg_recalc_compra_pago
  after insert or update or delete on public.pagos_compras
  for each row execute function public.tg_recalc_compra_pago();

-- 7.5 Cita → Lead automático (deduplicado por email/teléfono)
create or replace function public.tg_consulta_to_lead()
returns trigger language plpgsql as $$
declare
  v_lead_id   uuid;
  v_tel_norm  text;
  v_email_lc  text;
begin
  -- Si ya viene asignado, no hacemos nada
  if new.lead_id is not null then
    return new;
  end if;

  v_tel_norm := regexp_replace(coalesce(new.telefono,''), '\D', '', 'g');
  v_email_lc := lower(coalesce(new.email,''));

  -- Buscar match por email O teléfono normalizado
  select id into v_lead_id
    from public.leads
   where (v_email_lc <> '' and lower(email) = v_email_lc)
      or (length(v_tel_norm) >= 7 and regexp_replace(coalesce(telefono,''),'\D','','g') = v_tel_norm)
   order by created_at asc
   limit 1;

  if v_lead_id is null then
    insert into public.leads (nombre, email, telefono, origen, total_citas, ultima_cita_at)
    values (new.nombre, new.email, new.telefono, 'cita_web', 1, new.created_at)
    returning id into v_lead_id;
  else
    update public.leads
       set total_citas    = total_citas + 1,
           ultima_cita_at = greatest(coalesce(ultima_cita_at, new.created_at), new.created_at),
           -- solo rellenar nombre/email/teléfono si están vacíos en el lead
           nombre   = case when nombre   is null or nombre   = '' then new.nombre   else nombre   end,
           email    = case when email    is null or email    = '' then new.email    else email    end,
           telefono = case when telefono is null or telefono = '' then new.telefono else telefono end
     where id = v_lead_id;
  end if;

  new.lead_id := v_lead_id;
  return new;
end $$;

drop trigger if exists trg_consulta_to_lead on public.consultas;
create trigger trg_consulta_to_lead
  before insert on public.consultas
  for each row execute function public.tg_consulta_to_lead();

-- 7.6 Mantener contadores de cotizaciones en lead
create or replace function public.tg_recalc_lead_cotizaciones()
returns trigger language plpgsql as $$
declare
  v_lead_id uuid;
begin
  v_lead_id := coalesce(new.lead_id, old.lead_id);

  update public.leads l
     set total_cotizaciones = (select count(*) from public.cotizaciones where lead_id = l.id),
         ultima_cotizacion_at = (select max(created_at) from public.cotizaciones where lead_id = l.id)
   where l.id = v_lead_id;

  return null;
end $$;

drop trigger if exists trg_recalc_lead_cot on public.cotizaciones;
create trigger trg_recalc_lead_cot
  after insert or update or delete on public.cotizaciones
  for each row execute function public.tg_recalc_lead_cotizaciones();

-- =====================================================================
-- 8. VISTAS PARA TESORERÍA
-- =====================================================================

-- 8.1 Cuentas por cobrar (cotizaciones aceptadas con saldo)
create or replace view public.v_cuentas_por_cobrar as
select
  c.id,
  c.numero,
  c.lead_id,
  l.razon_social,
  l.nombre as lead_nombre,
  c.total,
  c.monto_pagado,
  (c.total - c.monto_pagado) as saldo,
  c.aceptada_at,
  c.valida_hasta,
  greatest(0, (current_date - coalesce(c.aceptada_at::date, c.fecha_emision)))::int as dias_pendiente,
  case
    when (current_date - coalesce(c.aceptada_at::date, c.fecha_emision)) <= 30 then '0-30'
    when (current_date - coalesce(c.aceptada_at::date, c.fecha_emision)) <= 60 then '31-60'
    when (current_date - coalesce(c.aceptada_at::date, c.fecha_emision)) <= 90 then '61-90'
    else '+90'
  end as bucket_antiguedad
from public.cotizaciones c
left join public.leads l on l.id = c.lead_id
where c.estado = 'aceptada'
  and (c.total - c.monto_pagado) > 0;

-- 8.2 Cuentas por pagar (compras pendientes)
create or replace view public.v_cuentas_por_pagar as
select
  c.id,
  c.numero,
  c.ref_externa,
  c.proveedor_id,
  p.razon_social as proveedor,
  c.total,
  c.monto_pagado,
  (c.total - c.monto_pagado) as saldo,
  c.fecha_factura,
  c.fecha_vencimiento,
  greatest(0, (current_date - c.fecha_factura))::int as dias_pendiente,
  case
    when (current_date - c.fecha_factura) <= 30 then '0-30'
    when (current_date - c.fecha_factura) <= 60 then '31-60'
    when (current_date - c.fecha_factura) <= 90 then '61-90'
    else '+90'
  end as bucket_antiguedad
from public.compras c
left join public.proveedores p on p.id = c.proveedor_id
where c.estado = 'pendiente'
  and (c.total - c.monto_pagado) > 0;

-- 8.3 DSO y DPO (últimos 90 días)
create or replace view public.v_dso as
select
  avg(extract(epoch from (pagada_at - aceptada_at)) / 86400.0)::numeric(6,1) as dso_dias,
  count(*) as muestras
from public.cotizaciones
where estado = 'pagada'
  and aceptada_at is not null
  and pagada_at is not null
  and pagada_at >= now() - interval '90 days';

create or replace view public.v_dpo as
select
  avg(extract(epoch from (pagada_at - created_at)) / 86400.0)::numeric(6,1) as dpo_dias,
  count(*) as muestras
from public.compras
where estado = 'pagada'
  and pagada_at is not null
  and pagada_at >= now() - interval '90 days';

-- 8.4 Flujo diario últimos 30 días (para el gráfico del dashboard)
create or replace view public.v_flujo_diario as
with dias as (
  select generate_series(current_date - interval '29 days', current_date, interval '1 day')::date as dia
),
ingresos as (
  select fecha as dia, sum(monto) as ingresos
    from public.pagos_cotizaciones
   where fecha >= current_date - interval '29 days'
   group by fecha
),
costos as (
  select fecha as dia, sum(monto) as costos
    from public.pagos_compras
   where fecha >= current_date - interval '29 days'
   group by fecha
)
select
  d.dia,
  coalesce(i.ingresos, 0)::numeric(14,2) as ingresos,
  coalesce(c.costos, 0)::numeric(14,2)   as costos
from dias d
left join ingresos i on i.dia = d.dia
left join costos   c on c.dia = d.dia
order by d.dia;

-- =====================================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================================
alter table public.usuarios            enable row level security;
alter table public.leads               enable row level security;
alter table public.consultas           enable row level security;
alter table public.proveedores         enable row level security;
alter table public.cotizaciones        enable row level security;
alter table public.cotizacion_items    enable row level security;
alter table public.pagos_cotizaciones  enable row level security;
alter table public.compras             enable row level security;
alter table public.compra_items        enable row level security;
alter table public.pagos_compras       enable row level security;

-- Helper: ¿es admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and role = 'admin' and activo);
$$;

-- Helper: ¿está autenticado y activo?
create or replace function public.is_authed()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and activo);
$$;

-- USUARIOS: cada uno lee su perfil; admin lee/escribe todo
drop policy if exists usuarios_self_read   on public.usuarios;
drop policy if exists usuarios_admin_all   on public.usuarios;
create policy usuarios_self_read on public.usuarios
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy usuarios_admin_all on public.usuarios
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- CONSULTAS: insert público (sitio web anónimo), resto autenticado
drop policy if exists consultas_anon_insert on public.consultas;
drop policy if exists consultas_auth_read   on public.consultas;
drop policy if exists consultas_auth_write  on public.consultas;
create policy consultas_anon_insert on public.consultas
  for insert to anon with check (true);
create policy consultas_auth_read on public.consultas
  for select to authenticated using (public.is_authed());
create policy consultas_auth_write on public.consultas
  for update to authenticated using (public.is_authed()) with check (public.is_authed());
-- (delete solo admin)
drop policy if exists consultas_admin_delete on public.consultas;
create policy consultas_admin_delete on public.consultas
  for delete to authenticated using (public.is_admin());

-- Resto de tablas: cualquier usuario autenticado y activo
do $$
declare t text;
begin
  for t in select unnest(array[
    'leads','proveedores','cotizaciones','cotizacion_items',
    'pagos_cotizaciones','compras','compra_items','pagos_compras'
  ])
  loop
    execute format('drop policy if exists %I_all on public.%I;', t, t);
    execute format(
      'create policy %I_all on public.%I for all to authenticated
         using (public.is_authed()) with check (public.is_authed());', t, t);
  end loop;
end $$;

-- =====================================================================
-- 10. DATOS SEMILLA / MIGRACIÓN DE LOS REGISTROS ACTUALES
-- =====================================================================
-- Recorrer las consultas existentes que no tienen lead_id asignado
-- y dispararles el trigger manualmente.
update public.consultas set telefono = telefono where lead_id is null;

-- =====================================================================
-- FIN
-- =====================================================================
