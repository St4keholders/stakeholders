import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Users, Plus, Search, Filter } from '@/components/ui/CoolIcons'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

  return (
    <>
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Leads y Clientes
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Gestiona la base de datos de prospectos y clientes.
          </p>
        </div>
        <button className="bg-[var(--blue)] hover:bg-[#3d6fe5] text-white font-medium text-[0.85rem] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_16px_var(--blue-dim)] hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          Nuevo Lead
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="p-6 mb-2 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o documento..."
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
                      <button className="text-[var(--blue)] hover:text-[#3d6fe5] font-medium text-[0.8rem] transition-colors opacity-0 group-hover:opacity-100">
                        Ver perfil
                      </button>
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
