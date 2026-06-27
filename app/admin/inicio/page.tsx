import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import DashboardChart from './DashboardChart'
import DashboardCalendar from './DashboardCalendar'
import { format, startOfMonth, endOfMonth } from 'date-fns'

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n)
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const today = new Date()
  const startMonthStr = format(startOfMonth(today), 'yyyy-MM-dd')
  const endMonthStr = format(endOfMonth(today), 'yyyy-MM-dd')
  const todayStr = format(today, 'yyyy-MM-dd')

  // 1. Total Leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // 2. Ingresos del Mes
  const { data: ingresosData } = await supabase
    .from('pagos_cotizaciones')
    .select('monto')
    .gte('fecha', startMonthStr)
    .lte('fecha', endMonthStr)
  
  const ingresosMes = ingresosData?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

  // 3. Citas de hoy
  const { count: citasHoy } = await supabase
    .from('consultas')
    .select('*', { count: 'exact', head: true })
    .eq('fecha_consulta', todayStr)
    .neq('estado', 'cancelada')

  // 4. Costos del Mes
  const { data: costosData } = await supabase
    .from('pagos_compras')
    .select('monto')
    .gte('fecha', startMonthStr)
    .lte('fecha', endMonthStr)

  const costosMes = costosData?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

  // 5. Flujo Diario (Gráfico)
  const { data: flujoDiario } = await supabase
    .from('v_flujo_diario')
    .select('*')
    .order('dia', { ascending: true })

  // 6. Top Cotizaciones Mes
  const { data: topCotizaciones } = await supabase
    .from('cotizaciones')
    .select('id, numero, total, estado, leads(nombre, razon_social)')
    .gte('fecha_emision', startMonthStr)
    .lte('fecha_emision', endMonthStr)
    .order('total', { ascending: false })
    .limit(5)

  // 7. Top Compras Mes
  const { data: topCompras } = await supabase
    .from('compras')
    .select('id, numero, total, estado, proveedores(razon_social)')
    .gte('fecha_factura', startMonthStr)
    .lte('fecha_factura', endMonthStr)
    .order('total', { ascending: false })
    .limit(5)

  // 8. Fechas con citas este mes para el calendario
  const { data: citasMesData } = await supabase
    .from('consultas')
    .select('fecha_consulta')
    .gte('fecha_consulta', startMonthStr)
    .lte('fecha_consulta', endMonthStr)
    .neq('estado', 'cancelada')
  
  const citasMes = Array.from(new Set(citasMesData?.map(c => c.fecha_consulta) || []))

  // Obtenemos el nombre del usuario logueado para saludarlo
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('usuarios').select('nombre').eq('id', user?.id || '').single()
  const userName = profile?.nombre?.split(' ')[0] || 'Admin'

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <div className="font-mono text-[0.65rem] tracking-[0.28em] uppercase text-[var(--fg-dim)] flex items-center gap-3 mb-2 before:content-[''] before:w-8 before:h-[1px] before:bg-[var(--line)]">
            {format(today, 'MMMM yyyy', { locale: require('date-fns/locale/es') }).replace(/^\w/, c => c.toUpperCase())}
          </div>
          <h1 className="font-serif italic text-3xl text-[var(--blue)]">
            <span className="font-sans not-italic font-semibold text-[var(--fg)] tracking-tight mr-2">Hola,</span>
            {userName}
          </h1>
          <p className="mt-2.5 max-w-[560px] text-[var(--fg-dim)] text-[0.92rem] leading-relaxed">
            Resumen de actividad reciente. Los indicadores se actualizan en tiempo real conforme se registran pagos y movimientos.
          </p>
        </div>
        <div className="flex gap-2.5 items-center">
          <Link href="/admin/citas" className="bg-[var(--blue)] hover:bg-[#3d6fe5] text-white font-medium text-[0.85rem] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
            <CalendarIcon className="w-4 h-4" />
            Nueva cita
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 hover:border-[var(--line)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[0.78rem] text-[var(--fg-dim)] font-medium">Total Leads</div>
            <div className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans text-3xl font-semibold tracking-tight text-[var(--fg)] my-1 leading-tight">{totalLeads || 0}</div>
          <div className="text-[0.75rem] text-[var(--fg-dim)] flex items-center gap-1.5 mt-2">
            Registrados en sistema
          </div>
        </div>

        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 hover:border-[var(--line)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[0.78rem] text-[var(--fg-dim)] font-medium">Ingresos del Mes</div>
            <div className="w-8 h-8 rounded-lg bg-[#16a34a1a] text-[#4ade80] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans text-3xl font-semibold tracking-tight text-[var(--fg)] my-1 leading-tight">{formatCOP(ingresosMes)}</div>
          <div className="text-[0.75rem] text-[var(--fg-dim)] flex items-center gap-1.5 mt-2">
            Mes en curso
          </div>
        </div>

        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 hover:border-[var(--line)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[0.78rem] text-[var(--fg-dim)] font-medium">Citas para Hoy</div>
            <div className="w-8 h-8 rounded-lg bg-[#fbbf241a] text-[#fbbf24] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans text-3xl font-semibold tracking-tight text-[var(--fg)] my-1 leading-tight">{citasHoy || 0}</div>
          <div className="text-[0.75rem] text-[var(--fg-dim)] flex items-center gap-1.5 mt-2">
            Pendientes de atender
          </div>
        </div>

        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 hover:border-[var(--line)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[0.78rem] text-[var(--fg-dim)] font-medium">Costos del Mes</div>
            <div className="w-8 h-8 rounded-lg bg-[#f871711a] text-[#f87171] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans text-3xl font-semibold tracking-tight text-[var(--fg)] my-1 leading-tight">{formatCOP(costosMes)}</div>
          <div className="text-[0.75rem] text-[var(--fg-dim)] flex items-center gap-1.5 mt-2">
            Mes en curso
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
        {/* Gráfico Principal */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-6">
          <div className="flex justify-between items-baseline mb-5">
            <div>
              <div className="font-sans text-[1.1rem] font-semibold text-[var(--fg)]">
                Ingresos vs <em className="font-serif italic font-normal text-[var(--blue)]">Costos</em>
              </div>
              <div className="text-[0.75rem] text-[var(--fg-dim)] mt-1">Evolución diaria — últimos 30 días</div>
            </div>
          </div>
          <DashboardChart data={flujoDiario || []} />
        </div>

        {/* Laterales */}
        <div className="flex flex-col gap-4">
          <DashboardCalendar citasMes={citasMes} />

          {/* Top Cotizaciones */}
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex-1">
            <div className="font-sans text-[0.88rem] font-semibold flex items-center gap-2 mb-3 text-[var(--fg)]">
              <TrendingUp className="w-4 h-4 text-[var(--blue)]" /> Top Cotizaciones del Mes
            </div>
            <div className="flex flex-col">
              {topCotizaciones && topCotizaciones.length > 0 ? (
                topCotizaciones.map(cot => (
                  <Link key={cot.id} href={`/admin/ventas/${cot.id}`} className="flex justify-between items-center py-2.5 border-b border-[var(--line-soft)] last:border-0 group">
                    <div className="flex flex-col min-w-0 pr-2">
                      <strong className="text-[var(--fg)] text-[0.82rem] font-medium truncate group-hover:text-[var(--blue)] transition-colors">
                        {(cot.leads as any)?.nombre || (cot.leads as any)?.razon_social || 'Desconocido'}
                      </strong>
                      <span className="text-[var(--fg-dim)] text-[0.75rem] font-mono mt-0.5">{cot.numero}</span>
                    </div>
                    <div className="font-mono text-[#4ade80] text-[0.8rem] font-medium whitespace-nowrap">
                      {formatCOP(cot.total)}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-[var(--fg-dim)] text-[0.82rem] italic text-center py-4">No hay cotizaciones este mes.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Compras en row extra si quisiéramos, pero según plan va en el lateral. Para no amontonar lo pongo debajo como widget */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <div></div>
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5">
          <div className="font-sans text-[0.88rem] font-semibold flex items-center gap-2 mb-3 text-[var(--fg)]">
            <TrendingDown className="w-4 h-4 text-[var(--blue)]" /> Top Compras del Mes
          </div>
          <div className="flex flex-col">
            {topCompras && topCompras.length > 0 ? (
              topCompras.map(comp => (
                <Link key={comp.id} href={`/admin/compras/${comp.id}`} className="flex justify-between items-center py-2.5 border-b border-[var(--line-soft)] last:border-0 group">
                  <div className="flex flex-col min-w-0 pr-2">
                    <strong className="text-[var(--fg)] text-[0.82rem] font-medium truncate group-hover:text-[var(--blue)] transition-colors">
                      {(comp.proveedores as any)?.razon_social || 'Desconocido'}
                    </strong>
                    <span className="text-[var(--fg-dim)] text-[0.75rem] font-mono mt-0.5">{comp.numero}</span>
                  </div>
                  <div className="font-mono text-[#f87171] text-[0.8rem] font-medium whitespace-nowrap">
                    {formatCOP(comp.total)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-[var(--fg-dim)] text-[0.82rem] italic text-center py-4">No hay compras este mes.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
