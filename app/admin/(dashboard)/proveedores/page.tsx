import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Truck, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevoProveedorModal } from '@/components/admin/proveedores/NuevoProveedorModal'
import { DetalleProveedorModal } from '@/components/admin/proveedores/DetalleProveedorModal'
import { BotonEliminar } from '@/components/admin/BotonEliminar'
import { eliminarProveedor } from '@/app/admin/_actions/proveedores'
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

export default async function ProveedoresPage({ searchParams }: PageProps) {
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

  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' })

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Proveedores
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Gestiona la base de datos de proveedores y contratistas.
          </p>
        </div>
        <NuevoProveedorModal />
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--line-soft)] flex gap-4 items-center bg-[rgba(255,255,255,0.02)]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              type="text"
              placeholder="Buscar por razón social o NIT..."
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
                  <Link href={getSortLink(sortBy, sortOrder, 'razon_social')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Razón Social
                    <SortIcon column="razon_social" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'nit_rut')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    NIT / RUT
                    <SortIcon column="nit_rut" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium select-none">Contacto</th>
                <th className="px-6 py-4 font-medium">
                  <Link href={getSortLink(sortBy, sortOrder, 'tipo_servicio_producto')} className="flex items-center gap-1 hover:text-[var(--fg)] transition-colors select-none">
                    Servicio/Producto
                    <SortIcon column="tipo_servicio_producto" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </Link>
                </th>
                <th className="px-6 py-4 font-medium text-right select-none">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {proveedores && proveedores.length > 0 ? (
                proveedores.map((prov) => (
                  <tr key={prov.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)]">
                            {prov.razon_social || '—'}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            Registrado {format(new Date(prov.created_at), 'MMM yyyy', { locale: es })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--fg)] font-mono text-[0.8rem]">{prov.nit_rut || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--fg)]">{prov.email || '—'}</div>
                      <div className="text-[var(--fg-dim)] text-[0.8rem] mt-0.5">{prov.telefono || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[0.75rem] border border-[var(--line-soft)] text-[var(--fg-dim)] bg-[rgba(255,255,255,0.02)]">
                        {prov.tipo_servicio_producto || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                      <DetalleProveedorModal proveedor={prov} />
                      <BotonEliminar 
                        id={prov.id} 
                        action={eliminarProveedor} 
                        confirmMessage={`¿Estás seguro de que deseas eliminar al proveedor "${prov.razon_social}"?`} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay proveedores registrados.
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
