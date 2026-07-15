'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { crearCotizacion } from '@/app/admin/_actions/ventas'

interface NuevaCotizacionModalProps {
  leads?: { id: string, nombre: string, razon_social: string }[]
}

interface ItemCotizacion {
  descripcion: string
  cantidad: number
  precio_unitario: number
}

export function NuevaCotizacionModal({ leads = [] }: NuevaCotizacionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<ItemCotizacion[]>([
    { descripcion: '', cantidad: 1, precio_unitario: 0 }
  ])

  function formatCOP(n: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(n || 0)
  }

  const handleAddItem = () => {
    setItems([...items, { descripcion: '', cantidad: 1, precio_unitario: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof ItemCotizacion, value: string | number) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'descripcion' ? value : Number(value)
    } as ItemCotizacion
    setItems(newItems)
  }

  const totalCalculado = items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    // El total se calcula dinámicamente y se procesan los items
    formData.append('items', JSON.stringify(items))

    const result = await crearCotizacion(formData)

    if (result.ok) {
      setIsOpen(false)
      // Resetear formulario
      setItems([{ descripcion: '', cantidad: 1, precio_unitario: 0 }])
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
        description="Emite una nueva cotización para un cliente desglosando los conceptos y servicios."
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

          {/* Sección de Conceptos/Servicios de Cotización */}
          <div className="space-y-3 pt-2">
            <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              Servicios / Conceptos a Cotizar
            </label>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center bg-[var(--bg-raise)]/40 p-3 rounded-xl border border-[var(--line-soft)]/60">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Servicio o concepto"
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                      required
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-lg px-3 py-2 text-xs text-[var(--fg)] outline-none"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      placeholder="Cant"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                      required
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-lg px-2 py-2 text-xs text-[var(--fg)] outline-none text-center"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      placeholder="Precio Unit."
                      min="0"
                      step="1000"
                      value={item.precio_unitario || ''}
                      onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                      required
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-lg px-2 py-2 text-xs text-[var(--fg)] outline-none font-mono text-right"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      title="Eliminar línea"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-[var(--blue)] hover:text-[#3d6fe5] border border-[var(--blue)]/20 hover:border-[var(--blue)] bg-[var(--blue-dim)]/5 hover:bg-[var(--blue-dim)]/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                + Añadir Concepto
              </button>
              
              <div className="text-right flex items-center gap-2 justify-end">
                <span className="text-[10px] text-[var(--fg-dim)] font-mono uppercase tracking-wider">Total:</span>
                <span className="text-sm font-bold font-mono text-[#4ade80]">{formatCOP(totalCalculado)}</span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              Tipo de Ingreso (Contabilidad)
            </label>
            <select
              name="cuenta_ingreso"
              defaultValue="415515"
              className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] focus:border-[var(--blue)] rounded-xl px-4 py-2.5 text-sm outline-none text-[var(--fg)] transition-all"
            >
              <option value="415515">Desarrollos (Sitios web, automatizaciones) - 415515</option>
              <option value="415530">Contabilidades (Manejo de contabilidades) - 415530</option>
              <option value="415535">Honorarios (Asesoramiento de gestión) - 415535</option>
              <option value="415540">Asesorías urbanas (Act. técnicas) - 415540</option>
              <option value="421005">Inversiones (Financieros - Intereses) - 421005</option>
              <option value="429595">Ingresos no esperados (Diversos) - 429595</option>
            </select>
          </div>

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
