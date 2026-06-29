'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DetalleCotizacionModalProps {
  cotizacion: any
}

export function DetalleCotizacionModal({ cotizacion }: DetalleCotizacionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const estadoColors: Record<string, string> = {
    'borrador': 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/20',
    'enviada': 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
    'aceptada': 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    'rechazada': 'text-red-400 bg-red-400/10 border border-red-400/20',
    'vencida': 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  }

  function formatCOP(n: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(n || 0)
  }

  const handleDownload = () => {
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = `/admin/api/cotizaciones/${cotizacion.id}/pdf`
    link.target = '_blank'
    link.download = `${cotizacion.numero}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setIsDownloading(false), 1000)
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
        title={`Cotización ${cotizacion.numero}`}
        description="Revisa los detalles y descarga el PDF."
      >
        <div className="space-y-4">
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-start mb-4 border-b border-[var(--line-soft)] pb-4">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Cliente / Lead</p>
                <h3 className="text-[var(--fg)] font-medium text-lg mt-1">{cotizacion.leads?.nombre || 'Desconocido'}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${estadoColors[cotizacion.estado]}`}>
                {cotizacion.estado.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Emisión</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {cotizacion.fecha_emision ? format(new Date(cotizacion.fecha_emision), 'dd MMM, yyyy', { locale: es }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Moneda</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {cotizacion.moneda || 'COP'}
                </p>
              </div>
            </div>

            {cotizacion.notas && (
              <div className="mt-4 pt-4 border-t border-[var(--line-soft)]">
                  <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1">Notas / Concepto</p>
                  <p className="text-[var(--fg)] font-medium bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[var(--line-soft)] text-sm">
                    {cotizacion.notas}
                  </p>
              </div>
            )}
          </div>

          <div className="bg-[#0a0a0a] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--fg-dim)] text-sm">Subtotal</span>
              <span className="text-[var(--fg)]">{formatCOP(cotizacion.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--fg-dim)] text-sm">Descuento</span>
              <span className="text-[var(--fg)]">{formatCOP(cotizacion.descuento_total)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[var(--line-soft)] pt-3">
              <span className="text-[var(--fg)] font-medium">Total Cotización</span>
              <span className="text-[var(--blue)] font-bold text-lg">{formatCOP(cotizacion.total)}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between gap-3 border-t border-[var(--line-soft)] mt-6">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--line-soft)] text-[var(--fg)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--line)] text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <>Descargando...</>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[var(--blue)]" />
                  Descargar PDF
                </>
              )}
            </button>
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
