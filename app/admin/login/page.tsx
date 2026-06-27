'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#f5f5f0] font-sans">
      <div className="w-full max-w-md p-8 bg-[#0a0a0b] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[rgba(77,127,255,0.14)] text-[#4d7fff] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-serif italic text-2xl">Stakeholders</h1>
            <p className="font-mono text-[0.6rem] tracking-[0.28em] uppercase text-[#6b6b66] mt-1">Panel Admin</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block font-mono text-[0.7rem] uppercase tracking-wider text-[#6b6b66] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#111114] border border-[rgba(255,255,255,0.15)] rounded-lg px-4 py-3 text-sm focus:border-[#4d7fff] focus:outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block font-mono text-[0.7rem] uppercase tracking-wider text-[#6b6b66] mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#111114] border border-[rgba(255,255,255,0.15)] rounded-lg px-4 py-3 text-sm focus:border-[#4d7fff] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[#f87171] text-sm mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4d7fff] hover:bg-[#3d6fe5] text-white font-medium py-3 rounded-lg mt-2 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Ingresando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
