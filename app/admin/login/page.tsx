'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NeuralCanvas from '@/components/fx/NeuralCanvas'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/inicio')
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <div className="absolute inset-0 z-0">
        <NeuralCanvas />
      </div>
      
      <div className="relative z-10 w-full max-w-md p-10 bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[var(--line-soft)]">
          <div className="w-12 h-12 rounded-xl bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-serif italic text-3xl tracking-tight">Stakeholders</h1>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-[var(--fg-dim)] mt-1">Panel Admin</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block font-mono text-[0.75rem] uppercase tracking-wider text-[var(--fg-dim)] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-xl px-4 py-3 text-sm focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] outline-none transition-all duration-300"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block font-mono text-[0.75rem] uppercase tracking-wider text-[var(--fg-dim)] mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-xl px-4 py-3 text-sm focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] outline-none transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[var(--red)] text-sm mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--blue)] hover:bg-[#3d6fe5] text-white font-medium py-3.5 rounded-xl mt-4 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_16px_var(--blue-dim)] hover:shadow-[0_4px_20px_var(--blue-dim)] hover:-translate-y-0.5"
          >
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
