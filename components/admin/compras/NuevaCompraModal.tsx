'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { registrarCompra } from '@/app/admin/_actions/compras'

interface NuevaCompraModalProps {
  proveedores?: { id: string, razon_social: string }[]
}

export function NuevaCompraModal({ proveedores = [] }: NuevaCompraModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tipoCompra, setTipoCompra] = useState<'costo' | 'gasto'>('costo')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await registrarCompra(formData)

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
        Nueva Compra
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Registrar Compra"
        description="Ingresa los datos de la factura del proveedor."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input 
            label="Proveedor (Razón Social)" 
            name="proveedor" 
            required 
            placeholder="Ej. Papelería Central SAS"
            list="proveedores-list"
            autoComplete="off"
          />
          <datalist id="proveedores-list">
            {proveedores.map(p => (
              <option key={p.id} value={p.razon_social} />
            ))}
          </datalist>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Ref. Factura (Opcional)" 
              name="ref_externa" 
              placeholder="FV-12345"
            />
            <Input 
              label="Fecha de Factura" 
              name="fecha" 
              type="date"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Concepto" 
              name="concepto" 
              placeholder="Ej. Compra de insumos de oficina"
              required
            />
            <Input 
              label="Fecha Vencimiento" 
              name="fecha_vencimiento" 
              type="date"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
                Naturaleza
              </label>
              <select
                value={tipoCompra}
                onChange={(e) => setTipoCompra(e.target.value as 'costo' | 'gasto')}
                className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-xl px-4 py-2.5 text-sm outline-none text-[var(--fg)]"
              >
                <option value="costo">Costo</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
                Concepto de la compra
              </label>
              <select
                name="cuenta_gasto"
                className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-xl px-4 py-2.5 text-sm outline-none text-[var(--fg)]"
              >
                {tipoCompra === 'costo' ? (
                  <>
                    <option value="615540">Costo de servicios prestados - 615540</option>
                    <option value="615545">Costos de servidor - 615545</option>
                    <option value="615550">Costo de desarrollo - 615550</option>
                  </>
                ) : (
                  <>
                    <option value="510505">Gastos de administración - 510505</option>
                    <option value="519505">Gastos de ventas - 519505</option>
                    <option value="519595">Gastos por viáticos - 519595</option>
                    <option value="511035">Honorarios — Asesoría técnica - 511035</option>
                    <option value="512010">Arrendamientos - 512010</option>
                    <option value="513535">Servicios — Teléfono / Internet - 513535</option>
                    <option value="519530">Diversos — Útiles y papelería - 519530</option>
                    <option value="530505">Financieros — Gastos bancarios - 530505</option>
                  </>
                )}
              </select>
            </div>
          </div>
          
          <input 
            type="hidden" 
            name="cuenta_contrapartida" 
            value={tipoCompra === 'costo' ? '220505' : '233595'} 
          />

          <Input 
            label="Total (COP)" 
            name="total" 
            type="number"
            min="0"
            step="100"
            required
            placeholder="500000"
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Compra'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
