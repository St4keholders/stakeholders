import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import NeuralCanvas from '@/components/fx/NeuralCanvas'

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
    <div className="relative flex min-h-screen bg-[#050505] text-[var(--fg)] font-sans text-sm tracking-[0.01em] transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <NeuralCanvas />
      </div>
      
      <AdminSidebar user={user} />
      
      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 w-full min-w-0 p-4 pt-20 lg:p-12 flex flex-col">
        <div className="w-full max-w-[1500px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
