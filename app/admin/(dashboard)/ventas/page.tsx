import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DollarSign, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevaCotizacionModal } from '@/components/admin/ventas/NuevaCotizacionModal'
import { DetalleCotizacionModal } from '@/components/admin/ventas/DetalleCotizacionModal'
import { BotonEliminar } from '@/components/admin/BotonEliminar'
import { eliminarCotizacion } from '@/app/admin/_actions/ventas'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n)
}

function getSortLink(currentSortBy: string, currentSortOrder: string, column: string) {
  if (currentSortBy === column) {
    return `?sortBy=${column}&sortOrder=${currentSortOrder === 'asc' ? 'desc' : 'asc'}`
  }
  return `?sortBy=${column}&sortOrder=asc`
}

function SortIcon({ column, currentSortBy, currentSortOrder }: { column: string, currentSortBy: string, currentSortOrder: string }) {
  if (currentSortBy !== column) {
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1 inline-block" />
  }
  return currentSortOrder === 'asc' 
    ? <ArrowUp className="w-3.5 h-3.5 text-[var(--blue)] ml-1 inline-block" />
    : <ArrowDown className="w-3.5 h-3.5 text-[var(--blue)] ml-1 inline-block" />
}

export default async function VentasPage({ searchParams }: PageProps) {
  const { sortBy = 'fecha_emision', sortOrder = 'desc' } = await searchParams
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

  const { data: cotizaciones } = await supabase
    .from('cotizaciones')
    .select('*, leads(nombre, razon_social)')
    .order(sortBy, { ascending: sortOrder === 'asc' })

  const { data: leads } = await supabase
    .from('leads')
    .select('id, nombre, razon_social')
    .order('nombre', { ascending: true })

  const estadoColors: Record<string, string> = {
    'borrador': 'bg-[#94a3b81a] text-[#94a3b8] border-[#94a3b833]',
    'enviada': 'bg-[#fbbf241a] text-[#fbbf24] border-[#fbbf2433]',
    'aceptada': 'bg-[#4ade801a] text-[#4ade80] border-[#4ade8033]',
    'rechazada': 'bg-[#f871711a] text-[#f87171] border-[#f8717133]',
  }

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Ventas y Cotizaciones
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Administra presupuestos, ventas realizadas y su estado de cobro.
          </p>
        </div>
        <NuevaCotizacionModal leads={leads || []} />
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--line-soft)] flex gap-4 items-center bg-[rgba(255,255,255,0.02)]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
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
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'numero')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Cotización / Cliente
                    <SortIcon column="numero" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'fecha_emision')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Fecha
                    <SortIcon column="fecha_emision" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'total')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Total
                    <SortIcon column="total" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'estado')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Estado
                    <SortIcon column="estado" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium text-right select-none">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {cotizaciones && cotizaciones.length > 0 ? (
                cotizaciones.map((cot) => (
                  <tr key={cot.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)]">
                            {cot.numero}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            {(cot.leads as any)?.nombre || (cot.leads as any)?.razon_social || 'Cliente desconocido'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)]">
                      {format(new Date(cot.fecha_emision + 'T12:00:00'), 'MMM d, yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#4ade80] font-mono font-medium">{formatCOP(cot.total)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[0.7rem] font-mono uppercase tracking-wider border ${estadoColors[cot.estado]}`}>
                        {cot.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <DetalleCotizacionModal cotizacion={cot} />
                      <BotonEliminar 
                        id={cot.id} 
                        action={eliminarCotizacion} 
                        confirmMessage={`¿Estás seguro de que deseas eliminar la cotización ${cot.numero}?`} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay cotizaciones registradas.
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
