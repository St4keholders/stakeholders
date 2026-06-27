import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Home,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  LogOut,
  Settings,
  Moon,
  CreditCard
} from 'lucide-react'

// Dummy user for now, later we fetch from our DB
async function getUser() {
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
  if (!user) return null

  // Fetch role and details from DB
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile || { nombre: user.email?.split('@')[0] || 'User', role: 'admin' }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans text-sm tracking-[0.01em] transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="bg-[var(--bg-raise)] border-r border-[var(--line-soft)] flex flex-col py-6 sticky top-0 h-screen">
        <div className="px-6 pb-6 flex items-center gap-3 border-b border-[var(--line-soft)] mb-4">
          <div className="w-9 h-9 rounded-lg bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <div>
            <div className="font-serif italic text-lg leading-tight">Stakeholders</div>
            <div className="font-mono text-[0.6rem] tracking-[0.28em] uppercase text-[var(--fg-dim)] mt-[2px]">Panel Admin</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-4 pb-2 font-mono text-[0.6rem] tracking-[0.28em] uppercase text-[var(--fg-dim-2)]">Principal</div>
          <Link href="/admin/inicio" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg)] bg-[var(--blue-dim)] border-l-2 border-[var(--blue)] text-[0.88rem] transition-colors">
            <Home className="w-4 h-4 shrink-0" /> Inicio
          </Link>
          <Link href="/admin/citas" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <Calendar className="w-4 h-4 shrink-0" /> Citas
          </Link>
          <Link href="/admin/leads" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <Users className="w-4 h-4 shrink-0" /> Leads
          </Link>

          <div className="px-6 pt-4 pb-2 font-mono text-[0.6rem] tracking-[0.28em] uppercase text-[var(--fg-dim-2)] mt-4">Finanzas</div>
          <Link href="/admin/ventas" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <DollarSign className="w-4 h-4 shrink-0" /> Ventas
          </Link>
          <Link href="/admin/compras" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <ShoppingCart className="w-4 h-4 shrink-0" /> Compras
          </Link>
          <Link href="/admin/tesoreria" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <CreditCard className="w-4 h-4 shrink-0" /> Tesorería
          </Link>
          <Link href="/admin/proveedores" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <Users className="w-4 h-4 shrink-0" /> Proveedores
          </Link>

          <div className="px-6 pt-4 pb-2 font-mono text-[0.6rem] tracking-[0.28em] uppercase text-[var(--fg-dim-2)] mt-4">Sistema</div>
          <Link href="/admin/kpis" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
            <Activity className="w-4 h-4 shrink-0" /> KPIs
          </Link>
          {user.role === 'admin' && (
            <Link href="/admin/usuarios" className="flex items-center gap-3 px-6 py-2.5 text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--line-soft)] text-[0.88rem] transition-colors pl-[1.625rem]">
              <Settings className="w-4 h-4 shrink-0" /> Usuarios
            </Link>
          )}
        </div>

        <div className="mt-auto px-6 py-4 border-t border-[var(--line-soft)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center font-semibold text-[0.88rem]">
            {user.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.85rem] font-medium truncate">{user.nombre}</div>
            <div className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-[var(--fg-dim)]">{user.role}</div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--line)] transition-colors">
            <Moon className="w-3.5 h-3.5" />
          </button>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--line)] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="p-8 max-w-[1600px] w-full">
        {children}
      </main>
    </div>
  )
}
