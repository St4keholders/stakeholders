'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { crearLead } from '@/app/admin/_actions/leads'

export function NuevoLeadModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await crearLead(formData)

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
        Nuevo Lead
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Nuevo Lead"
        description="Ingresa los datos del nuevo prospecto o cliente."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input 
            label="Nombre Completo" 
            name="nombre" 
            required 
            placeholder="Ej. María Gómez"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Email" 
              name="email" 
              type="email"
              placeholder="maria@ejemplo.com"
            />
            <Input 
              label="Teléfono" 
              name="telefono" 
              placeholder="+57 300 000 0000"
            />
          </div>

          <div className="pt-2 pb-2">
            <h3 className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] border-b border-[var(--line-soft)] pb-2 mb-2">
              Datos Fiscales (Opcional)
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Select 
                label="Tipo Doc" 
                name="tipo_documento"
                options={[
                  { value: 'CC', label: 'CC' },
                  { value: 'NIT', label: 'NIT' },
                  { value: 'CE', label: 'CE' }
                ]}
              />
            </div>
            <div className="col-span-2">
              <Input 
                label="Número de Documento" 
                name="numero_documento" 
              />
            </div>
          </div>
          
          <Input 
            label="Razón Social" 
            name="razon_social" 
          />
          
          <Input 
            label="Dirección" 
            name="direccion" 
          />

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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
