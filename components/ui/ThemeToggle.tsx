"use client"

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Check initial preference from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light')
      } else {
        document.documentElement.classList.remove('light')
      }
    } else {
      // Default to dark, ensure light class is removed
      document.documentElement.classList.remove('light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  // Prevent hydration mismatch on initial render by not showing the icon
  // until we know the theme
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--line-soft)] text-[var(--fg-dim)] opacity-50 cursor-default">
        <Moon className="w-3.5 h-3.5" />
      </button>
    )
  }

  return (
    <button 
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--line)] hover:bg-[var(--line-soft)] active:scale-[0.97] transition-[color,background-color,border-color,transform] duration-200 ease-out"
      title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
    </button>
  )
}
