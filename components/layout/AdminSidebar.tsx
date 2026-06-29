"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  LogOut,
  Settings,
  CreditCard
} from '@/components/ui/CoolIcons'
import { ThemeToggle } from '../ui/ThemeToggle'

interface UserProps {
  nombre: string
  role: string
}

export function AdminSidebar({ user }: { user: UserProps }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Helper function to determine if a link is active
  const isActive = (path: string) => pathname?.startsWith(path)

  // Reusable NavLink component for consistency
  const NavLink = ({ 
    href, 
    icon: Icon, 
    label,
    index
  }: { 
    href: string, 
    icon: any, 
    label: string,
    index: number
  }) => {
    const active = isActive(href)
    return (
      <Link 
        href={href} 
        onClick={() => setIsOpen(false)}
        className={`animate-in-stagger flex items-center gap-3 px-3 py-2.5 mx-3 mb-1 rounded-lg text-[0.82rem] font-medium transition-all duration-200 ease-out ${
          active 
            ? 'bg-[var(--fg)] text-[var(--bg)] shadow-md' 
            : 'text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[rgba(255,255,255,0.03)]'
        }`}
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ease-out ${active ? 'text-[var(--bg)]' : ''}`} /> 
        {label}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 right-5 z-50 p-2.5 bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-xl text-[var(--fg)] shadow-2xl"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        w-[240px] bg-[#050505] lg:bg-[rgba(255,255,255,0.01)] border-r border-[var(--line-soft)] flex flex-col py-6 shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-6 pb-6 flex items-center gap-3 border-b border-[var(--line-soft)] mb-2 animate-in-stagger" style={{ animationDelay: '0ms' }}>
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <img src="/logo-nexo.png" alt="Stakeholders Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="font-serif italic text-lg leading-tight text-[var(--fg)]">Stakeholders</div>
          <div className="font-mono text-[0.6rem] tracking-[0.28em] uppercase text-[var(--blue)] mt-[2px]">Panel Admin</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 py-2">
        <div className="px-6 pt-3 pb-1 font-mono text-[0.62rem] tracking-[0.28em] uppercase text-[var(--fg-dim-2)] font-semibold animate-in-stagger" style={{ animationDelay: '40ms' }}>Principal</div>
        <NavLink href="/admin/inicio" icon={Home} label="Inicio" index={2} />
        <NavLink href="/admin/citas" icon={Calendar} label="Citas" index={3} />
        <NavLink href="/admin/leads" icon={Users} label="Leads" index={4} />

        <div className="px-6 pt-5 pb-1 font-mono text-[0.62rem] tracking-[0.28em] uppercase text-[var(--fg-dim-2)] font-semibold animate-in-stagger" style={{ animationDelay: '200ms' }}>Finanzas</div>
        <NavLink href="/admin/ventas" icon={DollarSign} label="Ventas" index={6} />
        <NavLink href="/admin/compras" icon={ShoppingCart} label="Compras" index={7} />
        <NavLink href="/admin/tesoreria" icon={CreditCard} label="Tesorería" index={8} />
        <NavLink href="/admin/proveedores" icon={Users} label="Proveedores" index={9} />

        <div className="px-6 pt-5 pb-1 font-mono text-[0.62rem] tracking-[0.28em] uppercase text-[var(--fg-dim-2)] font-semibold animate-in-stagger" style={{ animationDelay: '400ms' }}>Sistema</div>
        <NavLink href="/admin/kpis" icon={Activity} label="KPIs" index={11} />
        {user.role === 'admin' && (
          <NavLink href="/admin/usuarios" icon={Settings} label="Usuarios" index={12} />
        )}
      </div>

      <div className="mt-auto px-6 py-4 border-t border-[var(--line-soft)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--blue-dim)] text-[var(--blue)] flex items-center justify-center font-semibold text-[0.88rem] shadow-[inset_0_0_0_1px_rgba(77,127,255,0.2)]">
          {user.nombre?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.85rem] font-medium truncate text-[var(--fg)]">{user.nombre}</div>
          <div className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-[var(--fg-dim)]">{user.role}</div>
        </div>
        <ThemeToggle />
        <form action="/auth/signout" method="post">
          <button type="submit" title="Cerrar sesión" className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--line-soft)] active:scale-[0.97] transition-[color,background-color,border-color,transform] duration-200 ease-out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
    </>
  )
}
