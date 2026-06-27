import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CreditCard, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
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

  const { data: ingresos } = await supabase
    .from('pagos_cotizaciones')
    .select('*, cotizaciones(numero, leads(nombre, razon_social))')
    .order('fecha', { ascending: false })
    .limit(10)

  const { data: egresos } = await supabase
    .from('pagos_compras')
    .select('*, compras(numero, proveedores(razon_social))')
    .order('fecha', { ascending: false })
    .limit(10)
    
  // Combinar y ordenar
  const movimientos = [
    ...(ingresos || []).map(i => ({ ...i, tipo: 'ingreso', ref: i.cotizaciones?.numero, nombre: (i.cotizaciones?.leads as any)?.nombre || (i.cotizaciones?.leads as any)?.razon_social })),
    ...(egresos || []).map(e => ({ ...e, tipo: 'egreso', ref: e.compras?.numero, nombre: (e.compras?.proveedores as any)?.razon_social }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Tesorería y Flujo
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Control de ingresos, egresos y conciliación bancaria.
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
                <th className="px-6 py-4 font-medium">Movimiento</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Método</th>
                <th className="px-6 py-4 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {movimientos && movimientos.length > 0 ? (
                movimientos.map((mov, idx) => (
                  <tr key={idx} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mov.tipo === 'ingreso' ? 'bg-[#4ade801a] text-[#4ade80]' : 'bg-[#f871711a] text-[#f87171]'}`}>
                          {mov.tipo === 'ingreso' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)]">
                            Pago {mov.ref || 'N/A'}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            {mov.nombre || 'Desconocido'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)]">
                      {format(new Date(mov.fecha), 'MMM d, yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[0.7rem] font-mono uppercase tracking-wider border border-[var(--line-soft)] text-[var(--fg-dim)] bg-[rgba(255,255,255,0.02)]">
                        {mov.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-mono font-medium ${mov.tipo === 'ingreso' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                        {mov.tipo === 'ingreso' ? '+' : '-'}{formatCOP(mov.monto)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay movimientos registrados.
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
