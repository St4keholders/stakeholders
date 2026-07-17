'use client'

import { useState, useEffect } from 'react'
import { Download, Loader2, Plus, Trash2, CreditCard } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { actualizarCompra, registrarPagoCompra, eliminarPagoCompra } from '@/app/admin/_actions/compras'
import { createClient } from '@/lib/supabase/client'

interface DetalleCompraModalProps {
  compra: any
}

export function DetalleCompraModal({ compra }: DetalleCompraModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados para abonos
  const [pagos, setPagos] = useState<any[]>([])
  const [cargandoPagos, setCargandoPagos] = useState(false)
  const [mostrarFormAbono, setMostrarFormAbono] = useState(false)
  const [montoAbono, setMontoAbono] = useState('')
  const [metodoAbono, setMetodoAbono] = useState('transferencia')
  const [refAbono, setRefAbono] = useState('')
  const [fechaAbono, setFechaAbono] = useState('')
  const [errorAbono, setErrorAbono] = useState('')
  const [guardandoAbono, setGuardandoAbono] = useState(false)

  const supabase = createClient()

  const cargarPagos = async () => {
    setCargandoPagos(true)
    const { data } = await supabase
      .from('pagos_compras')
      .select('*')
      .eq('compra_id', compra.id)
      .order('fecha', { ascending: false })
    if (data) setPagos(data)
    setCargandoPagos(false)
  }

  useEffect(() => {
    if (isOpen) {
      cargarPagos()
      setMostrarFormAbono(false)
      setErrorAbono('')
      setMontoAbono('')
      setRefAbono('')
      setFechaAbono(new Date().toISOString().split('T')[0])
    }
  }, [isOpen, compra.id])

  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const saldoRestante = Math.max(0, compra.total - totalPagado)

  const handleGuardarAbono = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardandoAbono(true)
    setErrorAbono('')

    const formData = new FormData()
    formData.append('fecha', fechaAbono)
    formData.append('monto', montoAbono)
    formData.append('metodo', metodoAbono)
    formData.append('referencia', refAbono)

    const res = await registrarPagoCompra(compra.id, formData)
    if (res.ok) {
      setMontoAbono('')
      setRefAbono('')
      setMostrarFormAbono(false)
      await cargarPagos()
    } else {
      setErrorAbono(res.error || 'Error al guardar el abono')
    }
    setGuardandoAbono(false)
  }

  const handleEliminarAbono = async (pagoId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este abono?')) return
    const res = await eliminarPagoCompra(pagoId, compra.id)
    if (res.ok) {
      await cargarPagos()
    } else {
      alert(res.error || 'Error al eliminar el abono')
    }
  }

  const estadoColors: Record<string, string> = {
    'pendiente': 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
    'pagada': 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    'anulada': 'text-zinc-400 bg-zinc-400/10 border border-zinc-400/20',
  }

  const gastoNombres: Record<string, string> = {
    '615540': 'Costo de servicios prestados (615540)',
    '615545': 'Costos de servidor (615545)',
    '615550': 'Costo de desarrollo (615550)',
    '615555': 'Costo por contratación de terceros (615555)',
    '510505': 'Gastos de administración (510505)',
    '519505': 'Gastos de ventas (519505)',
    '519595': 'Gastos por viáticos (519595)',
    '511035': 'Honorarios — Asesoría técnica (511035)',
    '512010': 'Arrendamientos (512010)',
    '513535': 'Servicios — Teléfono / Internet (513535)',
    '519530': 'Diversos — Útiles y papelería (519530)',
    '519910': 'Provisiones — Deudores (519910)',
    '530505': 'Financieros — Gastos bancarios (530505)',
  }

  const contrapartidaNombres: Record<string, string> = {
    '220505': 'Proveedores nacionales (220505)',
    '233525': 'Honorarios por pagar (233525)',
    '233530': 'Servicios técnicos por pagar (233530)',
    '233595': 'Otros costos y gastos por pagar (233595)',
  }

  function formatCOP(n: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(n || 0)
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await actualizarCompra(compra.id, formData)
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
        title={`Compra ${compra.numero}`}
        description="Detalle de la transacción con el proveedor."
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-start mb-4 border-b border-[var(--line-soft)] pb-4">
              <div>
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Proveedor</p>
                <h3 className="text-[var(--fg)] font-medium text-lg mt-1">{compra.proveedores?.razon_social || 'Desconocido'}</h3>
              </div>
              {!isEditing ? (
                <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${estadoColors[compra.estado]}`}>
                  {compra.estado.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              ) : (
                <select
                  name="estado"
                  defaultValue={compra.estado}
                  className="bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg px-2 py-1 text-sm text-[var(--fg)] outline-none focus:border-[var(--blue)]"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                  <option value="anulada">Anulada</option>
                </select>
              )}
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

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--line-soft)]">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1">Concepto</p>
                <p className="text-[var(--fg)] font-medium bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[var(--line-soft)]">
                  {compra.concepto || 'Sin concepto detallado'}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1">Fecha Vencimiento</p>
                {!isEditing ? (
                  <p className="text-[var(--fg)] font-medium mt-1">
                    {compra.fecha_vencimiento ? format(new Date(compra.fecha_vencimiento), 'dd MMM, yyyy', { locale: es }) : '—'}
                  </p>
                ) : (
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    defaultValue={compra.fecha_vencimiento || ''}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--blue)]"
                  />
                )}
              </div>
            </div>

            {!isEditing && (compra.cuenta_gasto || compra.cuenta_contrapartida) && (
              <div className="mt-4 pt-4 border-t border-[var(--line-soft)] grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1">Naturaleza (Costo/Gasto)</p>
                  <p className="text-[var(--fg)] font-medium text-xs font-mono bg-[rgba(255,255,255,0.02)] p-2.5 rounded-lg border border-[var(--line-soft)]">
                    {gastoNombres[compra.cuenta_gasto] || compra.cuenta_gasto || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[0.75rem] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1">Contrapartida (Pasivo)</p>
                  <p className="text-[var(--fg)] font-medium text-xs font-mono bg-[rgba(255,255,255,0.02)] p-2.5 rounded-lg border border-[var(--line-soft)]">
                    {contrapartidaNombres[compra.cuenta_contrapartida] || compra.cuenta_contrapartida || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sección de Abonos / Pagos */}
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[var(--line-soft)] pb-2">
              <h4 className="font-serif italic text-[var(--blue)] text-md flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Historial de Pagos
              </h4>
              {!isEditing && saldoRestante > 0 && !mostrarFormAbono && (
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormAbono(true);
                    setMontoAbono(saldoRestante.toString());
                  }}
                  className="text-xs bg-[var(--blue-dim)] text-[var(--blue)] font-medium px-2.5 py-1.5 rounded-lg hover:bg-[var(--blue)] hover:text-white transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar Pago / Abono
                </button>
              )}
            </div>

            {mostrarFormAbono && (
              <div className="bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg p-3 space-y-3">
                <h5 className="text-xs font-semibold text-[var(--fg)]">Nuevo Pago / Abono</h5>
                {errorAbono && (
                  <div className="text-xs p-2 bg-[var(--red)]/10 text-[var(--red)] rounded-md border border-[var(--red)]/15">
                    {errorAbono}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[0.68rem] uppercase font-mono tracking-wider text-[var(--fg-dim)]">Monto</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={montoAbono}
                      onChange={e => setMontoAbono(e.target.value)}
                      placeholder="Monto en COP"
                      className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] outline-none focus:border-[var(--blue)] mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase font-mono tracking-wider text-[var(--fg-dim)]">Fecha</label>
                    <input
                      type="date"
                      required
                      value={fechaAbono}
                      onChange={e => setFechaAbono(e.target.value)}
                      className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] outline-none focus:border-[var(--blue)] mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase font-mono tracking-wider text-[var(--fg-dim)]">Método</label>
                    <select
                      value={metodoAbono}
                      onChange={e => setMetodoAbono(e.target.value)}
                      className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] outline-none focus:border-[var(--blue)] mt-0.5"
                    >
                      <option value="transferencia">Transferencia</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[0.68rem] uppercase font-mono tracking-wider text-[var(--fg-dim)]">Referencia</label>
                    <input
                      type="text"
                      value={refAbono}
                      onChange={e => setRefAbono(e.target.value)}
                      placeholder="Ej. Nro egreso"
                      className="w-full bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] outline-none focus:border-[var(--blue)] mt-0.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setMostrarFormAbono(false)}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] text-xs font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarAbono}
                    disabled={guardandoAbono}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--blue)] text-white hover:bg-[#3d6fe5] text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {guardandoAbono ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Guardar'}
                  </button>
                </div>
              </div>
            )}

            {cargandoPagos ? (
              <div className="text-center py-4 text-xs text-[var(--fg-dim)]">Cargando pagos...</div>
            ) : pagos.length > 0 ? (
              <div className="overflow-hidden border border-[var(--line-soft)] rounded-lg">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-[var(--bg-raise)] border-b border-[var(--line-soft)] text-[var(--fg-dim)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Fecha</th>
                      <th className="px-3 py-2 font-medium">Método</th>
                      <th className="px-3 py-2 font-medium">Referencia</th>
                      <th className="px-3 py-2 font-medium text-right">Monto</th>
                      {!isEditing && <th className="px-3 py-2 font-medium text-right"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line-soft)] bg-[var(--bg-elevated)]">
                    {pagos.map((p) => (
                      <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group/row">
                        <td className="px-3 py-2 text-[var(--fg)]">
                          {format(new Date(p.fecha + 'T12:00:00'), 'dd MMM, yyyy', { locale: es })}
                        </td>
                        <td className="px-3 py-2 text-[var(--fg-dim)] capitalize">{p.metodo}</td>
                        <td className="px-3 py-2 text-[var(--fg-dim)] truncate max-w-[100px]">{p.referencia || '—'}</td>
                        <td className="px-3 py-2 text-right text-[var(--fg)] font-medium font-mono">{formatCOP(p.monto)}</td>
                        {!isEditing && (
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleEliminarAbono(p.id)}
                              className="text-[var(--red)] hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[var(--fg-dim)] italic bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg">
                No se han registrado pagos para esta compra.
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--fg-dim)] text-sm">Subtotal</span>
              <span className="text-[var(--fg)]">{formatCOP(compra.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--fg-dim)] text-sm">IVA Total</span>
              <span className="text-[var(--fg)]">{formatCOP(compra.iva_total)}</span>
            </div>
            <div className="flex justify-between items-center mb-2 border-t border-[var(--line-soft)] pt-2">
              <span className="text-[var(--fg-dim)] text-sm">Total Factura</span>
              <span className="text-[var(--fg)] font-medium">{formatCOP(compra.total)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--fg-dim)] text-sm">Monto Pagado</span>
              <span className="text-[#4ade80] font-medium">{formatCOP(totalPagado)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[var(--line-soft)] pt-3">
              <span className="text-[var(--fg)] font-medium">Saldo Restante</span>
              <span className="text-[var(--blue)] font-bold text-lg">{formatCOP(saldoRestante)}</span>
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
                  Editar Datos
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

