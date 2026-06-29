'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DetalleCitaModalProps {
  cita: any
}

export function DetalleCitaModal({ cita }: DetalleCitaModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const estadoColors: Record<string, string> = {
    'pendiente': 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    'confirmada': 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    'completada': 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    'cancelada': 'text-red-400 bg-red-400/10 border border-red-400/20',
    'no_asistio': 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/20',
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
        onClose={() => setIsOpen(false)}
        title="Detalles de la Cita"
        description="Información completa de la cita o consulta."
      >
        <div className="space-y-4">
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[var(--fg)] font-medium text-lg">{cita.cliente_nombre || 'Sin nombre'}</h3>
                <p className="text-[var(--fg-dim)] text-sm">{cita.email || 'Sin email'}</p>
                <p className="text-[var(--fg-dim)] text-sm">{cita.telefono || 'Sin teléfono'}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${estadoColors[cita.estado]}`}>
                {cita.estado.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--line-soft)]">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {cita.fecha_hora ? format(new Date(cita.fecha_hora), 'dd MMM, yyyy', { locale: es }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Hora</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {cita.fecha_hora ? format(new Date(cita.fecha_hora), 'HH:mm', { locale: es }) : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[#3d6fe5] text-sm font-medium transition-colors shadow-[0_4px_16px_var(--blue-dim)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
