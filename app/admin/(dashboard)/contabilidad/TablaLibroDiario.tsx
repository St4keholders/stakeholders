'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookOpen, ChevronDown, ChevronRight, Eye } from 'lucide-react'

interface Movimiento {
  id: string
  cuenta_codigo: string
  debito: number
  credito: number
  tercero_id: string | null
}

interface Comprobante {
  id: string
  concepto: string
  fecha: string
  tipo: string
  origen_modulo: string | null
  origen_id: string | null
  movimientos?: Movimiento[]
}

interface TablaLibroDiarioProps {
  comprobantes: Comprobante[]
  cuentasMap: Record<string, any>
  tercerosMap: Record<string, string>
  tipoComprobanteEtiquetas: Record<string, string>
  fechaInicio: string
  fechaFin: string
  tipoComprobante: string
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n || 0)
}

export function TablaLibroDiario({
  comprobantes,
  cuentasMap,
  tercerosMap,
  tipoComprobanteEtiquetas,
  fechaInicio,
  fechaFin,
  tipoComprobante
}: TablaLibroDiarioProps) {
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({})

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.72rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
            <tr>
              <th className="px-6 py-4 font-medium w-[40px]"></th>
              <th className="px-6 py-4 font-medium">Asiento / Transacción</th>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Tercero Principal</th>
              <th className="px-6 py-4 font-medium text-right">Total Débito</th>
              <th className="px-6 py-4 font-medium text-right">Total Crédito</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line-soft)]/60">
            {comprobantes.length > 0 ? (
              comprobantes.flatMap((comp) => {
                const lineas = comp.movimientos || []
                const estaExpandido = !!expandidos[comp.id]
                
                // Calcular los totales del comprobante
                const totalDebito = lineas.reduce((sum, l) => sum + Number(l.debito || 0), 0)
                const totalCredito = lineas.reduce((sum, l) => sum + Number(l.credito || 0), 0)

                // Encontrar el tercero principal (del primer movimiento que lo tenga)
                const primerTerceroId = lineas.find(l => l.tercero_id)?.tercero_id
                const terceroPrincipal = primerTerceroId ? (tercerosMap[primerTerceroId] || 'Tercero') : '—'

                return [
                  // Fila Principal del Comprobante (Resumen)
                  <tr 
                    key={`header-${comp.id}`} 
                    onClick={() => toggleExpandir(comp.id)}
                    className="hover:bg-[rgba(77,127,255,0.03)] cursor-pointer transition-colors select-none"
                  >
                    <td className="px-6 py-4 text-center">
                      {estaExpandido ? (
                        <ChevronDown className="w-4 h-4 text-[var(--blue)] mx-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--fg-dim)] mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[var(--fg)] text-sm">{comp.concepto}</span>
                        {comp.origen_modulo && comp.origen_id && (
                          <Link
                            href={`/admin/contabilidad?tab=diario&verModulo=${comp.origen_modulo}&verId=${comp.origen_id}${fechaInicio ? `&fechaInicio=${fechaInicio}` : ''}${fechaFin ? `&fechaFin=${fechaFin}` : ''}${tipoComprobante ? `&tipoComprobante=${tipoComprobante}` : ''}`}
                            onClick={(e) => e.stopPropagation()} // Evitar que expanda/colapse al dar click en origen
                            className="font-mono text-[0.7rem] bg-[var(--blue-dim)] text-[var(--blue)] px-2 py-0.5 rounded hover:bg-[var(--blue)] hover:text-white transition-colors"
                          >
                            Ver Origen
                          </Link>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--fg-dim)] mt-0.5 uppercase tracking-wide">
                        Ref: {comp.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)] text-xs">
                      {format(new Date(comp.fecha + 'T12:00:00'), 'MMM d, yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)] font-mono text-[0.72rem]">
                      {tipoComprobanteEtiquetas[comp.tipo] || comp.tipo}
                    </td>
                    <td className="px-6 py-4 text-[var(--fg-dim)] text-xs truncate max-w-[200px]">
                      {terceroPrincipal}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[var(--fg)]">
                      {formatCOP(totalDebito)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[var(--fg)]">
                      {formatCOP(totalCredito)}
                    </td>
                  </tr>,
                  // Filas de los Movimientos Desglosados (se muestran si está expandido)
                  ...(estaExpandido
                    ? lineas.map((linea) => {
                        const cuentaInfo = cuentasMap[linea.cuenta_codigo]
                        const nombreCuenta = cuentaInfo ? `${linea.cuenta_codigo} - ${cuentaInfo.nombre}` : linea.cuenta_codigo

                        return (
                          <tr 
                            key={`linea-${linea.id}`} 
                            className="bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)] transition-colors border-l-2 border-[var(--blue)]"
                          >
                            <td className="px-6 py-2.5"></td>
                            <td className="px-6 py-2.5 font-medium pl-8" colSpan={2}>
                              <Link 
                                href={`/admin/contabilidad?tab=t&cuenta=${linea.cuenta_codigo}`}
                                className="text-[var(--blue)] hover:underline flex items-center gap-1.5"
                              >
                                <BookOpen className="w-3.5 h-3.5 shrink-0 text-[var(--blue)]" />
                                {nombreCuenta}
                              </Link>
                            </td>
                            <td className="px-6 py-2.5 text-[var(--fg-dim)] text-xs">
                              {/* Tipo de asiento sutil */}
                              Desglose Cuenta
                            </td>
                            <td className="px-6 py-2.5 text-[var(--fg-dim)] text-xs truncate max-w-[150px]">
                              {linea.tercero_id ? (tercerosMap[linea.tercero_id] || 'Tercero') : '—'}
                            </td>
                            <td className="px-6 py-2.5 text-right font-mono font-medium text-[var(--fg)] text-xs">
                              {linea.debito > 0 ? formatCOP(linea.debito) : '—'}
                            </td>
                            <td className="px-6 py-2.5 text-right font-mono font-medium text-[var(--fg)] text-xs">
                              {linea.credito > 0 ? formatCOP(linea.credito) : '—'}
                            </td>
                          </tr>
                        )
                      })
                    : []
                  )
                ]
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
  )
}
