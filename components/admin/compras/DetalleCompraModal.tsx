'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DetalleCompraModalProps {
  compra: any
}

export function DetalleCompraModal({ compra }: DetalleCompraModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const estadoColors: Record<string, string> = {
    'pendiente': 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    'pagado': 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    'anulado': 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/20',
  }

  function formatCOP(n: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(n || 0)
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
        title={`Compra ${compra.numero}`}
        description="Detalle de la transacción con el proveedor."
      >
        <div className="space-y-4">
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-start mb-4 border-b border-[var(--line-soft)] pb-4">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Proveedor</p>
                <h3 className="text-[var(--fg)] font-medium text-lg mt-1">{compra.proveedores?.razon_social || 'Desconocido'}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${estadoColors[compra.estado]}`}>
                {compra.estado.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha Factura</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {compra.fecha_factura ? format(new Date(compra.fecha_factura), 'dd MMM, yyyy', { locale: es }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Ref Externa</p>
                <p className="text-[var(--fg)] font-medium mt-1">
                  {compra.ref_externa || 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--line-soft)]">
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1">Concepto</p>
                <p className="text-[var(--fg)] font-medium bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[var(--line-soft)]">
                  {compra.concepto || 'Sin concepto detallado'}
                </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--fg-dim)] text-sm">Subtotal</span>
              <span className="text-[var(--fg)]">{formatCOP(compra.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--fg-dim)] text-sm">IVA Total</span>
              <span className="text-[var(--fg)]">{formatCOP(compra.iva_total)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[var(--line-soft)] pt-3">
              <span className="text-[var(--fg)] font-medium">Total Factura</span>
              <span className="text-[var(--blue)] font-bold text-lg">{formatCOP(compra.total)}</span>
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
