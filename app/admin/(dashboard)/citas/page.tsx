import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Calendar, Search, Filter } from '@/components/ui/CoolIcons'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevaCitaModal } from '@/components/admin/citas/NuevaCitaModal'
import { DetalleCitaModal } from '@/components/admin/citas/DetalleCitaModal'
import { BotonEliminar } from '@/components/admin/BotonEliminar'
import { eliminarCita } from '@/app/admin/_actions/citas'
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

export default async function CitasPage({ searchParams }: PageProps) {
  const { sortBy = 'fecha_consulta', sortOrder = 'desc' } = await searchParams
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

  const query = supabase
    .from('consultas')
    .select('*, leads(nombre)')

  if (sortBy === 'fecha_consulta') {
    query
      .order('fecha_consulta', { ascending: sortOrder === 'asc' })
      .order('hora_consulta', { ascending: sortOrder === 'asc' })
  } else {
    query.order(sortBy, { ascending: sortOrder === 'asc' })
  }

  const { data: citas } = await query

  const estadoColors: Record<string, string> = {
    'pendiente': 'text-[#fbbf24]',
    'atendida': 'text-[#4ade80]',
    'cancelada': 'text-[#f87171]',
    'no_asistio': 'text-[#94a3b8]',
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Gestión de Citas
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Administra las consultas agendadas, reprograma o marca asistencia.
          </p>
        </div>
        <NuevaCitaModal />
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden shadow-md">
        <div className="p-6 mb-2 flex gap-4 items-center">
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
                  <Link href={getSortLink(sortBy, sortOrder, 'fecha_consulta')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Fecha y Hora
                    <SortIcon column="fecha_consulta" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'nombre')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Paciente / Lead
                    <SortIcon column="nombre" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium select-none">Contacto</th>
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
                      <span className={`inline-flex items-center gap-2 text-[0.82rem] font-medium ${estadoColors[cita.estado]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${estadoColors[cita.estado].replace('text-', 'bg-')}`} />
                        {cita.estado.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <DetalleCitaModal cita={cita} />
                      <BotonEliminar 
                        id={cita.id} 
                        action={eliminarCita} 
                        confirmMessage={`¿Estás seguro de que deseas eliminar esta cita para el paciente "${cita.nombre || 'este paciente'}"?`} 
                      />
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
