import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CreditCard, ArrowUpRight, ArrowDownRight, Search, Filter, AlertCircle, Calendar } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n)
}

export default async function TesoreriaPage() {
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

  // Consultar cotizaciones pendientes (cuentas por cobrar)
  const { data: pendientesCobro } = await supabase
    .from('cotizaciones')
    .select('id, numero, leads(nombre, razon_social), total, moneda, valida_hasta, estado')
    .in('estado', ['enviada', 'aceptada'])
    .order('valida_hasta', { ascending: true, nullsFirst: false })

  // Consultar compras pendientes (cuentas por pagar)
  const { data: pendientesPago } = await supabase
    .from('compras')
    .select('id, numero, proveedores(razon_social), total, fecha_vencimiento, estado')
    .eq('estado', 'pendiente')
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false })
    
  // Combinar y ordenar por fecha
  const movimientos = [
    ...(pendientesCobro || []).map(c => ({ 
      id: c.id,
      tipo: 'por_cobrar', 
      ref: c.numero, 
      nombre: (c.leads as any)?.nombre || (c.leads as any)?.razon_social,
      monto: c.total,
      fecha: c.valida_hasta,
      estado: c.estado
    })),
    ...(pendientesPago || []).map(p => ({ 
      id: p.id,
      tipo: 'por_pagar', 
      ref: p.numero, 
      nombre: (p.proveedores as any)?.razon_social,
      monto: p.total,
      fecha: p.fecha_vencimiento,
      estado: p.estado
    }))
  ].sort((a, b) => {
    if (!a.fecha) return 1
    if (!b.fecha) return -1
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Tesorería y Flujo
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Control de cuentas por cobrar y por pagar pendientes (Deadlines).
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--line-soft)] flex gap-4 items-center bg-[rgba(255,255,255,0.02)]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              type="text"
              placeholder="Buscar transacción..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg pl-9 pr-4 py-2 text-sm focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] outline-none transition-all"
            />
          </div>
          <button className="px-4 py-2 rounded-lg border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--line)] text-sm flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              <tr>
                <th className="px-6 py-4 font-medium">Movimiento / Cliente / Proveedor</th>
                <th className="px-6 py-4 font-medium">Fecha Límite (Deadline)</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {movimientos && movimientos.length > 0 ? (
                movimientos.map((mov, idx) => {
                  const hasDate = Boolean(mov.fecha)
                  const isVencido = hasDate && isPast(new Date(mov.fecha)) && !isToday(new Date(mov.fecha))
                  const esPorCobrar = mov.tipo === 'por_cobrar'

                  return (
                    <tr key={idx} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${esPorCobrar ? 'bg-[#4ade801a] text-[#4ade80]' : 'bg-[#f871711a] text-[#f87171]'}`}>
                            {esPorCobrar ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--fg)]">
                              {esPorCobrar ? 'CxC' : 'CxP'} - {mov.ref || 'N/A'}
                            </div>
                            <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                              {mov.nombre || 'Desconocido'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasDate ? (
                          <div className={`flex items-center gap-2 ${isVencido ? 'text-[#f87171]' : 'text-[var(--fg)]'}`}>
                            <Calendar className="w-4 h-4" />
                            {format(new Date(mov.fecha), 'MMM d, yyyy', { locale: es })}
                            {isVencido && <span title="Vencido"><AlertCircle className="w-4 h-4" /></span>}
                          </div>
                        ) : (
                          <span className="text-[var(--fg-dim)] italic">Sin fecha límite</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[0.7rem] font-mono uppercase tracking-wider border border-[var(--line-soft)] text-[var(--fg-dim)] bg-[rgba(255,255,255,0.02)]">
                          {mov.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-mono font-medium ${esPorCobrar ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                          {esPorCobrar ? '+' : '-'}{formatCOP(mov.monto)}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay cuentas por cobrar o por pagar registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
