import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpDown, BookOpen, Calendar, DollarSign, Filter, Search, FileText, ArrowLeftRight, Check, X } from 'lucide-react'
import { SelectorCuenta } from './SelectorCuenta'
import { ModalDetalleTransaccion } from './ModalDetalleTransaccion'

interface PageProps {
  searchParams: Promise<{
    tab?: string
    cuenta?: string
    fechaInicio?: string
    fechaFin?: string
    tipoComprobante?: string
    verModulo?: string
    verId?: string
  }>
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n || 0)
}

export default async function ContabilidadPage({ searchParams }: PageProps) {
  const params = await searchParams
  const activeTab = params.tab || 'diario'
  const cuentaSeleccionada = params.cuenta || ''
  const fechaInicio = params.fechaInicio || ''
  const fechaFin = params.fechaFin || ''
  const tipoComprobante = params.tipoComprobante || ''

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // Consultar Plan de Cuentas (para el selector del libro T)
  const { data: cuentas } = await supabase
    .from('cuentas')
    .select('*')
    .order('codigo', { ascending: true })

  // Mapeo de cuentas para acceso rápido
  const cuentasMap = (cuentas || []).reduce((acc, c) => {
    acc[c.codigo] = c
    return acc
  }, {} as Record<string, any>)

  // Consultar leads y proveedores para mapear nombres de terceros
  const { data: leads } = await supabase.from('leads').select('id, nombre, razon_social')
  const { data: proveedores } = await supabase.from('proveedores').select('id, razon_social')

  const tercerosMap: Record<string, string> = {};
  (leads || []).forEach(l => {
    tercerosMap[l.id] = l.nombre || l.razon_social || 'Cliente';
  });

  (proveedores || []).forEach((p: { id: string, razon_social: string }) => {
    tercerosMap[p.id] = p.razon_social || 'Proveedor';
  });

  // --- LÓGICA DE DATOS SEGÚN PESTAÑA ---
  let comprobantesFiltrados: any[] = []
  let movimientosLibroT: any[] = []
  let saldoInicialT = 0
  let totalDebitoT = 0
  let totalCreditoT = 0

  if (activeTab === 'diario') {
    let query = supabase
      .from('comprobantes')
      .select('*, movimientos(*)')
      .order('fecha', { ascending: false })

    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio)
    }
    if (fechaFin) {
      query = query.lte('fecha', fechaFin)
    }
    if (tipoComprobante) {
      query = query.eq('tipo', tipoComprobante)
    }

    const { data } = await query
    comprobantesFiltrados = data || []
  } else if (activeTab === 't' && cuentaSeleccionada) {
    // Consultar todos los movimientos de esta cuenta
    const { data: movs } = await supabase
      .from('movimientos')
      .select('*, comprobantes(*)')
      .eq('cuenta_codigo', cuentaSeleccionada)

    if (movs) {
      // Ordenar por fecha del comprobante en memoria
      movimientosLibroT = [...movs].sort((a, b) => {
        const dateA = a.comprobantes ? new Date(a.comprobantes.fecha).getTime() : 0
        const dateB = b.comprobantes ? new Date(b.comprobantes.fecha).getTime() : 0
        return dateA - dateB
      })

      // Calcular saldos
      const nat = cuentasMap[cuentaSeleccionada]?.naturaleza || 'debito'
      let saldo = 0
      movimientosLibroT = movimientosLibroT.map(m => {
        const deb = Number(m.debito || 0)
        const cred = Number(m.credito || 0)
        totalDebitoT += deb
        totalCreditoT += cred

        if (nat === 'debito') {
          saldo += (deb - cred)
        } else {
          saldo += (cred - deb)
        }

        return {
          ...m,
          saldoProgresivo: saldo
        }
      })
    }
  }

  // Mapear tipos de comprobantes a etiquetas amigables
  const tipoComprobanteEtiquetas: Record<string, string> = {
    'causacion_venta': 'Causación Venta',
    'causacion_compra': 'Causación Compra',
    'recaudo_venta': 'Recaudo de Cartera',
    'pago_compra': 'Pago a Proveedor'
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-[var(--fg)] tracking-tight">
            Contabilidad y *Libros*
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Consulte el libro diario de operaciones y el mayor auxiliar (Libro T) en tiempo real.
          </p>
        </div>
      </div>

      {/* PESTAÑAS (TABS) */}
      <div className="flex border-b border-[var(--line-soft)] mb-6">
        <Link
          href={`/admin/contabilidad?tab=diario${fechaInicio ? `&fechaInicio=${fechaInicio}` : ''}${fechaFin ? `&fechaFin=${fechaFin}` : ''}${tipoComprobante ? `&tipoComprobante=${tipoComprobante}` : ''}`}
          className={`px-6 py-3 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'diario'
              ? 'border-[var(--blue)] text-[var(--fg)]'
              : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
          }`}
        >
          Libro Diario
        </Link>
        <Link
          href={`/admin/contabilidad?tab=t${cuentaSeleccionada ? `&cuenta=${cuentaSeleccionada}` : ''}`}
          className={`px-6 py-3 border-b-2 text-sm font-medium transition-all ${
            activeTab === 't'
              ? 'border-[var(--blue)] text-[var(--fg)]'
              : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
          }`}
        >
          Libro T / Mayor Auxiliar
        </Link>
      </div>

      {/* DETALLES DE CADA TABS */}
      {activeTab === 'diario' ? (
        <div className="space-y-6 animate-fade-in">
          {/* FILTROS LIBRO DIARIO */}
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <form method="GET" action="/admin/contabilidad" className="w-full flex flex-wrap gap-4 items-end">
              <input type="hidden" name="tab" value="diario" />
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1.5">Tipo Asiento</label>
                <select
                  name="tipoComprobante"
                  defaultValue={tipoComprobante}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--blue)]"
                >
                  <option value="">Todos los comprobantes</option>
                  <option value="causacion_venta">Causación de Ventas</option>
                  <option value="causacion_compra">Causación de Compras</option>
                  <option value="recaudo_venta">Recaudo de Ventas (Cartera)</option>
                  <option value="pago_compra">Pago de Compras (Egreso)</option>
                </select>
              </div>

              <div className="w-[170px]">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1.5">Desde</label>
                <input
                  type="date"
                  name="fechaInicio"
                  defaultValue={fechaInicio}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--blue)]"
                />
              </div>

              <div className="w-[170px]">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-1.5">Hasta</label>
                <input
                  type="date"
                  name="fechaFin"
                  defaultValue={fechaFin}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--line-soft)] rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--blue)]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--blue)] hover:bg-[#3d6fe5] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                </button>
                {(fechaInicio || fechaFin || tipoComprobante) && (
                  <Link
                    href="/admin/contabilidad?tab=diario"
                    className="px-4 py-2 border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    Limpiar
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* TABLA LIBRO DIARIO */}
          <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.72rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Asiento / Concepto</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Cuenta Contable</th>
                    <th className="px-6 py-4 font-medium">Tercero</th>
                    <th className="px-6 py-4 font-medium text-right">Débito</th>
                    <th className="px-6 py-4 font-medium text-right">Crédito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line-soft)]">
                  {comprobantesFiltrados.length > 0 ? (
                    comprobantesFiltrados.map((comp) => {
                      const lineas = comp.movimientos || []
                      return (
                        <tr key={comp.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                          <td colSpan={7} className="p-0">
                            <div className="bg-[rgba(77,127,255,0.01)] px-6 py-3 border-b border-[var(--line-soft)] flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[var(--blue)]" />
                                <span className="font-medium text-[var(--fg)]">{comp.concepto}</span>
                                {comp.origen_modulo && comp.origen_id && (
                                  <Link
                                    href={`/admin/contabilidad?tab=diario&verModulo=${comp.origen_modulo}&verId=${comp.origen_id}${fechaInicio ? `&fechaInicio=${fechaInicio}` : ''}${fechaFin ? `&fechaFin=${fechaFin}` : ''}${tipoComprobante ? `&tipoComprobante=${tipoComprobante}` : ''}`}
                                    className="ml-2 font-mono text-[0.7rem] bg-[var(--blue-dim)] text-[var(--blue)] px-2 py-0.5 rounded hover:bg-[var(--blue)] hover:text-white transition-colors"
                                  >
                                    Ver Origen
                                  </Link>
                                )}
                              </div>
                              <span className="font-mono text-[0.72rem] text-[var(--fg-dim)] uppercase tracking-wider">
                                Ref: {comp.id.substring(0, 8)}
                              </span>
                            </div>
                            <table className="w-full text-xs">
                              <tbody>
                                {lineas.map((linea: any, lIdx: number) => {
                                  const cuentaInfo = cuentasMap[linea.cuenta_codigo]
                                  const nombreCuenta = cuentaInfo ? `${linea.cuenta_codigo} - ${cuentaInfo.nombre}` : linea.cuenta_codigo

                                  return (
                                    <tr key={linea.id} className="border-b border-[var(--line-soft)]/40 last:border-b-0 hover:bg-[rgba(255,255,255,0.015)]">
                                      <td className="px-6 py-3 w-[30%] text-[var(--fg-dim)]"></td>
                                      <td className="px-6 py-3 w-[12%] text-[var(--fg-dim)]">
                                        {format(new Date(comp.fecha + 'T12:00:00'), 'MMM d, yyyy', { locale: es })}
                                      </td>
                                      <td className="px-6 py-3 w-[12%] text-[var(--fg-dim)] font-mono text-[0.72rem]">
                                        {tipoComprobanteEtiquetas[comp.tipo] || comp.tipo}
                                      </td>
                                      <td className="px-6 py-3 w-[20%] font-medium">
                                        <Link 
                                          href={`/admin/contabilidad?tab=t&cuenta=${linea.cuenta_codigo}`}
                                          className="text-[var(--blue)] hover:underline flex items-center gap-1.5"
                                        >
                                          <BookOpen className="w-3 h-3 shrink-0" />
                                          {nombreCuenta}
                                        </Link>
                                      </td>
                                      <td className="px-6 py-3 w-[16%] text-[var(--fg-dim)] truncate max-w-[150px]">
                                        {linea.tercero_id ? (tercerosMap[linea.tercero_id] || 'Tercero desconocido') : '—'}
                                      </td>
                                      <td className="px-6 py-3 w-[10%] text-right font-mono font-medium text-[var(--fg)]">
                                        {linea.debito > 0 ? formatCOP(linea.debito) : '—'}
                                      </td>
                                      <td className="px-6 py-3 w-[10%] text-right font-mono font-medium text-[var(--fg)]">
                                        {linea.credito > 0 ? formatCOP(linea.credito) : '—'}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                        No se encontraron comprobantes registrados en el rango o filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* SELECTOR DE CUENTA Y RESUMEN SALDOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Selector */}
            <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] mb-2 font-semibold">Seleccionar Cuenta Contable</label>
                <SelectorCuenta cuentas={cuentas || []} cuentaSeleccionada={cuentaSeleccionada} />
              </div>
              {cuentaSeleccionada && cuentasMap[cuentaSeleccionada] && (
                <div className="mt-4 pt-4 border-t border-[var(--line-soft)] flex justify-between items-center text-xs">
                  <span className="text-[var(--fg-dim)]">Naturaleza:</span>
                  <span className="font-mono font-semibold uppercase text-[var(--blue)] px-2 py-0.5 rounded bg-[var(--blue-dim)]">
                    {cuentasMap[cuentaSeleccionada].naturaleza}
                  </span>
                </div>
              )}
            </div>

            {/* Tarjeta Saldo Total */}
            {cuentaSeleccionada && (
              <>
                <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] font-semibold">Suma Débitos / Créditos</span>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--fg-dim)]">Total Débitos (D):</span>
                        <span className="font-mono font-medium text-[var(--fg)]">{formatCOP(totalDebitoT)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--fg-dim)]">Total Créditos (C):</span>
                        <span className="font-mono font-medium text-[var(--fg)]">{formatCOP(totalCreditoT)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(77,127,255,0.03)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] font-semibold">Saldo Final de Cuenta</span>
                    <h2 className="text-3xl font-serif italic text-[var(--fg)] mt-3">
                      {(() => {
                        const nat = cuentasMap[cuentaSeleccionada]?.naturaleza || 'debito'
                        const saldo = nat === 'debito' 
                          ? (totalDebitoT - totalCreditoT) 
                          : (totalCreditoT - totalDebitoT)
                        return formatCOP(saldo)
                      })()}
                    </h2>
                    <p className="text-[10px] font-mono text-[var(--fg-dim)] mt-2 uppercase tracking-wide">
                      Ajustado por naturaleza ({cuentasMap[cuentaSeleccionada]?.naturaleza})
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* TABLA MAYOR AUXILIAR */}
          {cuentaSeleccionada ? (
            <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.01)]">
                <h3 className="font-medium text-[var(--fg)]">Historial de Movimientos de la Cuenta</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.72rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Fecha</th>
                      <th className="px-6 py-4 font-medium">Comprobante / Concepto</th>
                      <th className="px-6 py-4 font-medium">Tercero</th>
                      <th className="px-6 py-4 font-medium text-right">Débito (D)</th>
                      <th className="px-6 py-4 font-medium text-right">Crédito (C)</th>
                      <th className="px-6 py-4 font-medium text-right">Saldo Acumulado</th>
                      <th className="px-6 py-4 font-medium text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line-soft)]">
                    {movimientosLibroT.length > 0 ? (
                      movimientosLibroT.map((mov) => (
                        <tr key={mov.id} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                          <td className="px-6 py-4 text-[var(--fg-dim)]">
                            {mov.comprobantes ? format(new Date(mov.comprobantes.fecha + 'T12:00:00'), 'MMM d, yyyy', { locale: es }) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-[var(--fg)]">
                              {mov.comprobantes?.concepto || 'Asiento General'}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--fg-dim)] mt-0.5">
                              Asiento: {tipoComprobanteEtiquetas[mov.comprobantes?.tipo] || mov.comprobantes?.tipo || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[var(--fg-dim)]">
                            {mov.tercero_id ? (tercerosMap[mov.tercero_id] || 'Tercero desconocido') : '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-medium text-[var(--fg)]">
                            {mov.debito > 0 ? formatCOP(mov.debito) : '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-medium text-[var(--fg)]">
                            {mov.credito > 0 ? formatCOP(mov.credito) : '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-medium text-[var(--blue)]">
                            {formatCOP(mov.saldoProgresivo)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {mov.comprobantes?.origen_modulo && mov.comprobantes?.origen_id ? (
                              <Link
                                href={`/admin/contabilidad?tab=t&cuenta=${cuentaSeleccionada}&verModulo=${mov.comprobantes.origen_modulo}&verId=${mov.comprobantes.origen_id}`}
                                className="font-mono text-[0.7rem] bg-[var(--blue-dim)] text-[var(--blue)] px-2.5 py-1 rounded hover:bg-[var(--blue)] hover:text-white transition-colors"
                              >
                                Ver Origen
                              </Link>
                            ) : (
                              <span className="text-[var(--fg-dim)] text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                          No hay movimientos registrados para esta cuenta.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-12 text-center text-[var(--fg-dim)] italic">
              Por favor, selecciona una cuenta contable arriba para ver su mayor auxiliar y saldo acumulado.
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE DE TRANSACCIÓN ORIGEN */}
      {params.verModulo && params.verId && (
        <ModalDetalleTransaccion 
          modulo={params.verModulo} 
          id={params.verId} 
          backUrl={`/admin/contabilidad?tab=${activeTab}${cuentaSeleccionada ? `&cuenta=${cuentaSeleccionada}` : ''}${fechaInicio ? `&fechaInicio=${fechaInicio}` : ''}${fechaFin ? `&fechaFin=${fechaFin}` : ''}${tipoComprobante ? `&tipoComprobante=${tipoComprobante}` : ''}`} 
        />
      )}
    </>
  )
}
