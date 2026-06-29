'use client'

import { useState } from 'react'
import { Edit2, Loader2, Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { actualizarLead } from '@/app/admin/_actions/leads'

interface DetalleLeadModalProps {
  lead: any
}

export function DetalleLeadModal({ lead }: DetalleLeadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await actualizarLead(lead.id, formData)

    if (result.ok) {
      setIsEditing(false)
      // Opcional: cerrar el modal o mostrar un mensaje de éxito
    } else {
      setError(result.error || 'Ocurrió un error')
    }
    setIsLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[var(--blue)] hover:text-[#3d6fe5] font-medium text-[0.8rem] transition-colors opacity-0 group-hover:opacity-100"
      >
        Ver detalle
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setIsEditing(false)
          setError('')
        }}
        title="Detalles del Lead"
        description="Consulta o edita la información del cliente."
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
            defaultValue={lead.nombre}
            disabled={!isEditing}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Email" 
              name="email" 
              type="email"
              defaultValue={lead.email || ''}
              disabled={!isEditing}
            />
            <Input 
              label="Teléfono" 
              name="telefono" 
              defaultValue={lead.telefono || ''}
              disabled={!isEditing}
            />
          </div>

          <div className="pt-2 pb-2">
            <h3 className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] border-b border-[var(--line-soft)] pb-2 mb-2">
              Datos Fiscales
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Select 
                label="Tipo Doc" 
                name="tipo_documento"
                defaultValue={lead.tipo_documento || ''}
                disabled={!isEditing}
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
                defaultValue={lead.numero_documento || ''}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <Input 
            label="Razón Social" 
            name="razon_social" 
            defaultValue={lead.razon_social || ''}
            disabled={!isEditing}
          />
          
          <Input 
            label="Dirección" 
            name="direccion" 
            defaultValue={lead.direccion || ''}
            disabled={!isEditing}
          />

          <div className="pt-4 flex justify-between items-center border-t border-[var(--line-soft)] mt-6">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg border border-[var(--line-soft)] text-[var(--fg)] hover:bg-[var(--bg-raise)] text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar Datos
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isEditing) setIsEditing(false)
                  else setIsOpen(false)
                }}
                className="px-4 py-2 rounded-lg border border-[var(--line-soft)] text-[var(--fg)] hover:bg-[var(--bg-raise)] text-sm font-medium transition-colors"
              >
                {isEditing ? 'Cancelar' : 'Cerrar'}
              </button>
              {isEditing && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[#3d6fe5] text-sm font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-[0_4px_16px_var(--blue-dim)]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </>
  )
}
