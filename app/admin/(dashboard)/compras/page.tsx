import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ShoppingCart, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevaCompraModal } from '@/components/admin/compras/NuevaCompraModal'
import { DetalleCompraModal } from '@/components/admin/compras/DetalleCompraModal'

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n)
}

export default async function ComprasPage() {
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

  const { data: compras } = await supabase
    .from('compras')
    .select('*, proveedores(razon_social)')
    .order('fecha_factura', { ascending: false })

  const estadoColors: Record<string, string> = {
    'pendiente': 'bg-[#fbbf241a] text-[#fbbf24] border-[#fbbf2433]',
    'pagada': 'bg-[#4ade801a] text-[#4ade80] border-[#4ade8033]',
    'anulada': 'bg-[#f871711a] text-[#f87171] border-[#f8717133]',
  }

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Compras y Gastos
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Registro de compras a proveedores y control de gastos.
          </p>
        </div>
        <NuevaCompraModal />
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--line-soft)] flex gap-4 items-center bg-[rgba(255,255,255,0.02)]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              type="text"
              placeholder="Buscar por número o proveedor..."
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
                <th className="px-6 py-4 font-medium">Factura / Proveedor</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {compras && compras.length > 0 ? (
                compras.map((compra) => (
                  <tr key={compra.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)]">
                            {compra.numero}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            {(compra.proveedores as any)?.razon_social || 'Proveedor desconocido'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)]">
                      {format(new Date(compra.fecha_factura), 'MMM d, yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#f87171] font-mono font-medium">{formatCOP(compra.total)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[0.7rem] font-mono uppercase tracking-wider border ${estadoColors[compra.estado]}`}>
                        {compra.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DetalleCompraModal compra={compra} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay compras registradas.
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
