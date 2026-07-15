import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'
import Link from 'next/link'
import { X, Calendar, DollarSign, ShoppingCart, User, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ModalDetalleTransaccionProps {
  modulo: string
  id: string
  backUrl: string
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n || 0)
}

export async function ModalDetalleTransaccion({ modulo, id, backUrl }: ModalDetalleTransaccionProps) {
  const cookieStore = await nextCookies()
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

  let dataVenta: any = null
  let dataCompra: any = null
  let dataPagoVenta: any = null
  let dataPagoCompra: any = null

  if (modulo === 'ventas') {
    const { data } = await supabase
      .from('cotizaciones')
      .select('*, leads(nombre, razon_social), cotizacion_items(*)')
      .eq('id', id)
      .single()
    dataVenta = data
  } else if (modulo === 'compras') {
    const { data } = await supabase
      .from('compras')
      .select('*, proveedores(razon_social), compra_items(*)')
      .eq('id', id)
      .single()
    dataCompra = data
  } else if (modulo === 'pagos_ventas') {
    const { data } = await supabase
      .from('pagos_cotizaciones')
      .select('*, cotizaciones(numero, lead_id, leads(nombre, razon_social))')
      .eq('id', id)
      .single()
    dataPagoVenta = data
  } else if (modulo === 'pagos_compras') {
    const { data } = await supabase
      .from('pagos_compras')
      .select('*, compras(numero, proveedor_id, proveedores(razon_social))')
      .eq('id', id)
      .single()
    dataPagoCompra = data
  }

  const renderContent = () => {
    if (modulo === 'ventas' && dataVenta) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-[var(--line-soft)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Venta / Cotización</span>
              <h3 className="text-lg font-serif italic text-[var(--fg)] mt-1">{dataVenta.numero}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-mono uppercase tracking-wider border border-emerald-500/30 text-[#4ade80] bg-emerald-500/10">
              {dataVenta.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Cliente</span>
              <p className="font-medium text-[var(--fg)] mt-1">{dataVenta.leads?.nombre || dataVenta.leads?.razon_social || 'Desconocido'}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha Emisión</span>
              <p className="font-medium text-[var(--fg)] mt-1">
                {format(new Date(dataVenta.fecha_emision + 'T12:00:00'), 'dd MMM, yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Conceptos facturados</span>
            <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
              {(dataVenta.cotizacion_items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-[rgba(255,255,255,0.02)] p-2 rounded-lg border border-[var(--line-soft)]">
                  <span className="text-[var(--fg)] truncate max-w-[200px]">{item.descripcion}</span>
                  <span className="font-mono text-[var(--fg-dim)]">
                    {item.cantidad} x {formatCOP(item.precio_unitario)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[var(--line-soft)] rounded-xl p-4 flex justify-between items-center">
            <span className="text-[var(--fg)] font-medium">Monto Total</span>
            <span className="text-xl font-mono font-bold text-[#4ade80]">{formatCOP(dataVenta.total)}</span>
          </div>
        </div>
      )
    }

    if (modulo === 'compras' && dataCompra) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-[var(--line-soft)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Compra a Proveedor</span>
              <h3 className="text-lg font-serif italic text-[var(--fg)] mt-1">{dataCompra.numero}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-mono uppercase tracking-wider border border-amber-500/30 text-[#fbbf24] bg-amber-500/10">
              {dataCompra.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Proveedor</span>
              <p className="font-medium text-[var(--fg)] mt-1">{dataCompra.proveedores?.razon_social || 'Desconocido'}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha Factura</span>
              <p className="font-medium text-[var(--fg)] mt-1">
                {format(new Date(dataCompra.fecha_factura + 'T12:00:00'), 'dd MMM, yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Concepto</span>
            <p className="font-medium text-[var(--fg)] mt-1 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[var(--line-soft)] text-xs">
              {dataCompra.concepto || 'Sin concepto detallado'}
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[var(--line-soft)] rounded-xl p-4 flex justify-between items-center">
            <span className="text-[var(--fg)] font-medium">Monto Total</span>
            <span className="text-xl font-mono font-bold text-[#f87171]">{formatCOP(dataCompra.total)}</span>
          </div>
        </div>
      )
    }

    if (modulo === 'pagos_ventas' && dataPagoVenta) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-[var(--line-soft)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Recaudo de Factura / Venta</span>
              <h3 className="text-lg font-serif italic text-[var(--fg)] mt-1">Ref Pago: {dataPagoVenta.referencia || 'N/A'}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-mono uppercase tracking-wider border border-emerald-500/30 text-[#4ade80] bg-emerald-500/10">
              {dataPagoVenta.metodo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Cliente</span>
              <p className="font-medium text-[var(--fg)] mt-1">
                {dataPagoVenta.cotizaciones?.leads?.nombre || dataPagoVenta.cotizaciones?.leads?.razon_social || 'Desconocido'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha Pago</span>
              <p className="font-medium text-[var(--fg)] mt-1">
                {format(new Date(dataPagoVenta.fecha + 'T12:00:00'), 'dd MMM, yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--line-soft)] rounded-lg p-3 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Factura Afectada</span>
            <p className="font-medium text-[var(--fg)] mt-1">Cotización N° {dataPagoVenta.cotizaciones?.numero}</p>
          </div>

          {dataPagoVenta.notas && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Notas del pago</span>
              <p className="font-medium text-[var(--fg)] mt-1 text-xs bg-[rgba(255,255,255,0.02)] p-2 rounded-lg border border-[var(--line-soft)]">
                {dataPagoVenta.notas}
              </p>
            </div>
          )}

          <div className="bg-[#0a0a0a] border border-[var(--line-soft)] rounded-xl p-4 flex justify-between items-center">
            <span className="text-[var(--fg)] font-medium">Recaudado</span>
            <span className="text-xl font-mono font-bold text-[#4ade80]">{formatCOP(dataPagoVenta.monto)}</span>
          </div>
        </div>
      )
    }

    if (modulo === 'pagos_compras' && dataPagoCompra) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-[var(--line-soft)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Pago a Proveedor</span>
              <h3 className="text-lg font-serif italic text-[var(--fg)] mt-1">Ref Pago: {dataPagoCompra.referencia || 'N/A'}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[0.7rem] font-mono uppercase tracking-wider border border-amber-500/30 text-[#fbbf24] bg-amber-500/10">
              {dataPagoCompra.metodo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Proveedor</span>
              <p className="font-medium text-[var(--fg)] mt-1">
                {dataPagoCompra.compras?.proveedores?.razon_social || 'Desconocido'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Fecha Pago</span>
              <p className="font-medium text-[var(--fg)] mt-1">
                {format(new Date(dataPagoCompra.fecha + 'T12:00:00'), 'dd MMM, yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--line-soft)] rounded-lg p-3 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Factura de Compra</span>
            <p className="font-medium text-[var(--fg)] mt-1">Compra N° {dataPagoCompra.compras?.numero}</p>
          </div>

          {dataPagoCompra.notas && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Notas del pago</span>
              <p className="font-medium text-[var(--fg)] mt-1 text-xs bg-[rgba(255,255,255,0.02)] p-2 rounded-lg border border-[var(--line-soft)]">
                {dataPagoCompra.notas}
              </p>
            </div>
          )}

          <div className="bg-[#0a0a0a] border border-[var(--line-soft)] rounded-xl p-4 flex justify-between items-center">
            <span className="text-[var(--fg)] font-medium">Monto Pagado</span>
            <span className="text-xl font-mono font-bold text-[#f87171]">{formatCOP(dataPagoCompra.monto)}</span>
          </div>
        </div>
      )
    }

    return (
      <div className="py-12 text-center text-[var(--fg-dim)] italic">
        No se pudieron cargar los detalles de la transacción origen, o no está disponible.
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--line)] rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-in scale-in">
        <Link 
          href={backUrl}
          className="absolute top-4 right-4 text-[var(--fg-dim)] hover:text-[var(--fg)] p-1.5 rounded-lg hover:bg-[var(--line-soft)] transition-colors"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </Link>
        
        <div className="mt-2">
          {renderContent()}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--line-soft)] flex justify-end">
          <Link
            href={backUrl}
            className="px-5 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--line-soft)] text-sm font-medium text-[var(--fg)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--line)] transition-colors"
          >
            Volver
          </Link>
        </div>
      </div>
    </div>
  )
}
