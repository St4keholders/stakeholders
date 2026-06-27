import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Users, Plus, ShieldAlert, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { redirect } from 'next/navigation'

export default async function UsuariosPage() {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  // Check if current user is admin
  const { data: profile } = await supabase.from('usuarios').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert className="w-16 h-16 text-[var(--red)] mb-6 opacity-80" />
        <h1 className="font-serif italic text-3xl text-[var(--fg)] mb-2">Acceso Restringido</h1>
        <p className="text-[var(--fg-dim)] max-w-md">No tienes los permisos necesarios para acceder a la gestión de usuarios del sistema.</p>
      </div>
    )
  }

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="flex items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Usuarios del Sistema
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Gestiona los accesos y roles del equipo.
          </p>
        </div>
        <button className="bg-[var(--blue)] hover:bg-[#3d6fe5] text-white font-medium text-[0.85rem] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_16px_var(--blue-dim)] hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          Invitar Usuario
        </button>
      </div>

      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Registro</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {usuarios && usuarios.length > 0 ? (
                usuarios.map((usr) => (
                  <tr key={usr.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center font-semibold text-[0.85rem]">
                          {usr.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg)]">
                            {usr.nombre}
                          </div>
                          <div className="text-[var(--fg-dim)] font-mono text-[0.75rem] mt-0.5">
                            ID: {usr.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {usr.role === 'admin' && <ShieldCheck className="w-4 h-4 text-[var(--blue)]" />}
                        <span className="text-[var(--fg)] font-mono uppercase text-[0.75rem]">{usr.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[0.7rem] font-mono uppercase tracking-wider border bg-[#4ade801a] text-[#4ade80] border-[#4ade8033]">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)]">
                      {format(new Date(usr.created_at), 'MMM d, yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== usr.id && (
                        <button className="text-[var(--red)] hover:text-[#f87171] font-medium text-[0.8rem] transition-colors opacity-0 group-hover:opacity-100">
                          Revocar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay usuarios registrados.
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
