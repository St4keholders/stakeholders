'use client'

import { useRouter } from 'next/navigation'

interface Cuenta {
  codigo: string
  nombre: string
  naturaleza: string
  tipo: string
}

interface SelectorCuentaProps {
  cuentas: Cuenta[]
  cuentaSeleccionada: string
}

export function SelectorCuenta({ cuentas, cuentaSeleccionada }: SelectorCuentaProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value) {
      router.push(`/admin/contabilidad?tab=t&cuenta=${value}`)
    } else {
      router.push(`/admin/contabilidad?tab=t`)
    }
  }

  return (
    <select
      value={cuentaSeleccionada}
      onChange={handleChange}
      className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none"
    >
      <option value="">Selecciona una cuenta...</option>
      
      {/* Agrupar por Tipo de Cuenta */}
      {['activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto', 'costo'].map(tipo => {
        const cuentasPorTipo = cuentas.filter(c => c.tipo === tipo)
        if (cuentasPorTipo.length === 0) return null

        return (
          <optgroup key={tipo} label={tipo.toUpperCase()} className="font-mono text-xs tracking-wider">
            {cuentasPorTipo.map(c => (
              <option key={c.codigo} value={c.codigo}>
                {c.codigo} - {c.nombre}
              </option>
            ))}
          </optgroup>
        )
      })}
    </select>
  )
}
