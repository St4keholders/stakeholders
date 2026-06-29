'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { actualizarCita } from '@/app/admin/_actions/citas'
import { Loader2 } from 'lucide-react'

interface DetalleCitaModalProps {
  cita: any
}

export function DetalleCitaModal({ cita }: DetalleCitaModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const estadoColors: Record<string, string> = {
    'pendiente': 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    'confirmada': 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    'completada': 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    'cancelada': 'text-red-400 bg-red-400/10 border border-red-400/20',
    'no_asistio': 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/20',
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await actualizarCita(cita.id, formData)
    if (result.ok) {
      setIsEditing(false)
    } else {
      setError(result.error || 'Error al actualizar')
    }
    setIsLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); setIsEditing(false); setError(''); }}
        className="text-[var(--blue)] hover:text-[#3d6fe5] font-medium text-[0.8rem] transition-colors opacity-0 group-hover:opacity-100"
      >
        Ver detalle
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Detalles de la Cita"
        description="Información completa de la cita o consulta."
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[var(--fg)] font-medium text-lg">{cita.cliente_nombre || cita.nombre || 'Sin nombre'}</h3>
                <p className="text-[var(--fg-dim)] text-sm">{cita.email || 'Sin email'}</p>
                <p className="text-[var(--fg-dim)] text-sm">{cita.telefono || 'Sin teléfono'}</p>
              </div>
              {!isEditing ? (
                <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${estadoColors[cita.estado]}`}>
                  {cita.estado.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              ) : (
                <select
                  name="estado"
                  defaultValue={cita.estado}
                  className="bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg px-2 py-1 text-sm text-[var(--fg)] outline-none focus:border-[var(--blue)]"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="atendida">Atendida</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no_asistio">No Asistió</option>
                </select>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--line-soft)]">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {cita.fecha_consulta ? format(new Date(cita.fecha_consulta), 'dd MMM, yyyy', { locale: es }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Hora</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {cita.hora_consulta || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg border border-[var(--line-soft)] text-[var(--fg)] hover:bg-[var(--bg-raise)] text-sm font-medium transition-colors"
                >
                  Editar Estado
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[#3d6fe5] text-sm font-medium transition-colors shadow-[0_4px_16px_var(--blue-dim)]"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--line-soft)] text-[var(--fg)] hover:bg-[var(--bg-raise)] text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[#3d6fe5] text-sm font-medium transition-colors shadow-[0_4px_16px_var(--blue-dim)] flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </button>
              </>
            )}
          </div>
        </form>
      </Modal>
    </>
  )
}
