'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { crearCotizacion } from '@/app/admin/_actions/ventas'

interface NuevaCotizacionModalProps {
  leads?: { id: string, nombre: string, razon_social: string }[]
}

export function NuevaCotizacionModal({ leads = [] }: NuevaCotizacionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await crearCotizacion(formData)

    if (result.ok) {
      setIsOpen(false)
    } else {
      setError(result.error || 'Ocurrió un error')
    }
    setIsLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[var(--blue)] hover:bg-[#3d6fe5] text-white font-medium text-[0.85rem] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_16px_var(--blue-dim)] hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4" />
        Nueva Cotización
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Nueva Cotización"
        description="Emite una nueva cotización para un cliente."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input 
            label="Cliente o Lead (Nombre)" 
            name="cliente" 
            required 
            placeholder="Ej. Juan Pérez"
            list="leads-list"
            autoComplete="off"
          />
          <datalist id="leads-list">
            {leads.map(l => (
              <option key={l.id} value={l.nombre || l.razon_social || ''} />
            ))}
          </datalist>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Fecha Emisión" 
              name="fecha" 
              type="date"
              required
            />
            <Input 
              label="Válida Hasta" 
              name="valida_hasta" 
              type="date"
            />
          </div>
            <Input 
              label="Total (COP)" 
              name="total" 
              type="number"
              min="0"
              step="100"
              required
              placeholder="1500000"
            />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              Notas adicionales
            </label>
            <textarea
              name="notas"
              className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] focus:border-[var(--blue)] focus:ring-[var(--blue)] rounded-xl px-4 py-3 text-sm focus:ring-1 outline-none transition-all duration-300 text-[var(--fg)] placeholder-[var(--dim-2)] custom-scrollbar min-h-[100px]"
              placeholder="Condiciones de pago, tiempo de entrega, etc..."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg border border-[var(--line-soft)] text-[var(--fg)] hover:bg-[var(--bg-raise)] text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[#3d6fe5] text-sm font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-[0_4px_16px_var(--blue-dim)]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Emitir Cotización'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
