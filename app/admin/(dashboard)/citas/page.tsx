import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Calendar, Plus, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function CitasPage() {
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

  const { data: citas } = await supabase
    .from('consultas')
    .select('*, leads(nombre)')
    .order('fecha_consulta', { ascending: false })
    .order('hora_consulta', { ascending: false })

  const estadoColors: Record<string, string> = {
    'pendiente': 'bg-[#fbbf241a] text-[#fbbf24] border-[#fbbf2433]',
    'atendida': 'bg-[#4ade801a] text-[#4ade80] border-[#4ade8033]',
    'cancelada': 'bg-[#f871711a] text-[#f87171] border-[#f8717133]',
    'no_asistio': 'bg-[#94a3b81a] text-[#94a3b8] border-[#94a3b833]',
  }

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Gestión de Citas
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Administra las consultas agendadas, reprograma o marca asistencia.
          </p>
        </div>
        <button className="bg-[var(--blue)] hover:bg-[#3d6fe5] text-white font-medium text-[0.85rem] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_16px_var(--blue-dim)] hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
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
            <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                <th className="px-6 py-4 font-medium">Paciente / Lead</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {citas && citas.length > 0 ? (
                citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)] capitalize">
                            {format(new Date(cita.fecha_consulta + 'T12:00:00'), 'MMM d, yyyy', { locale: es })}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            {cita.hora_consulta}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg)] font-medium">
                      {cita.nombre || (cita.leads as any)?.nombre || 'Sin nombre'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--fg)]">{cita.email || '—'}</div>
                      <div className="text-[var(--fg-dim)] text-[0.8rem] mt-0.5">{cita.telefono || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[0.7rem] font-mono uppercase tracking-wider border ${estadoColors[cita.estado]}`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[var(--blue)] hover:text-[#3d6fe5] font-medium text-[0.8rem] transition-colors opacity-0 group-hover:opacity-100">
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay citas registradas.
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
