import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevoLeadModal } from '@/components/admin/leads/NuevoLeadModal'
import { DetalleLeadModal } from '@/components/admin/leads/DetalleLeadModal'

export default async function LeadsPage() {
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
    .order('created_at', { ascending: false })

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
            <thead className="bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.04)] text-[0.75rem] font-medium text-[var(--fg-dim)]">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre / Empresa</th>
                <th className="px-6 py-4 font-medium">Documento</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Fecha de Registro</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
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
                    <td className="px-6 py-4 text-right">
                      <DetalleLeadModal lead={lead} />
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
