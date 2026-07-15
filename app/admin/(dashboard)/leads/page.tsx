import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevoLeadModal } from '@/components/admin/leads/NuevoLeadModal'
import { DetalleLeadModal } from '@/components/admin/leads/DetalleLeadModal'
import { BotonEliminar } from '@/components/admin/BotonEliminar'
import { eliminarLead } from '@/app/admin/_actions/leads'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>
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

export default async function LeadsPage({ searchParams }: PageProps) {
  const { sortBy = 'created_at', sortOrder = 'desc' } = await searchParams
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

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' })

  const estadoColors: Record<string, string> = {
    'nuevo': 'bg-[#4d7fff1a] text-[#4d7fff] border-[#4d7fff33]',
    'contactado': 'bg-[#fbbf241a] text-[#fbbf24] border-[#fbbf2433]',
    'cotizado': 'bg-[#c084fc1a] text-[#c084fc] border-[#c084fc33]',
    'ganado': 'bg-[#4ade801a] text-[#4ade80] border-[#4ade8033]',
    'perdido': 'bg-[#f871711a] text-[#f87171] border-[#f8717133]',
    'frio': 'bg-[rgba(255,255,255,0.05)] text-[var(--fg-dim)] border-[var(--line-soft)]',
  }

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Directorio de Leads
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Gestiona la información de tus prospectos y clientes.
          </p>
        </div>
        <NuevoLeadModal />
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--line-soft)] flex gap-4 items-center bg-[rgba(255,255,255,0.02)]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
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
            <thead className="bg-[var(--bg-raise)] border-b border-[var(--line-soft)] text-[0.75rem] font-medium text-[var(--fg-dim)]">
              <tr>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'nombre')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Nombre / Empresa
                    <SortIcon column="nombre" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'numero_documento')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Documento
                    <SortIcon column="numero_documento" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium select-none">Contacto</th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'created_at')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Fecha de Registro
                    <SortIcon column="created_at" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium text-right select-none">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center font-semibold text-[0.85rem]">
                          {(lead.nombre || lead.razon_social || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)]">
                            {lead.nombre || '—'}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            {lead.razon_social || 'Sin empresa'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--fg)] font-mono text-[0.8rem]">{lead.numero_documento || '—'}</div>
                      <div className="text-[var(--fg-dim)] text-[0.7rem] uppercase">{lead.tipo_documento || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--fg)]">{lead.email || '—'}</div>
                      <div className="text-[var(--fg-dim)] text-[0.8rem] mt-0.5">{lead.telefono || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)]">
                      {format(new Date(lead.created_at), 'MMM d, yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <DetalleLeadModal lead={lead} />
                      <BotonEliminar 
                        id={lead.id} 
                        action={eliminarLead} 
                        confirmMessage={`¿Estás seguro de que deseas eliminar el lead "${lead.nombre || 'este lead'}"?`} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay leads registrados.
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
