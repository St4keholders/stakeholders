import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { format, isPast, isToday, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  AlertCircle, 
  Calendar,
  Wallet,
  ArrowDown,
  ArrowUp,
  Percent,
  ListFilter,
  Eye,
  X
} from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    expandTercero?: string
    expandCuenta?: string
    quincenaSel?: 'primera' | 'segunda'
  }>
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n || 0)
}

export default async function TesoreriaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const expandTercero = params.expandTercero || ''
  const expandCuenta = params.expandCuenta || ''
  
  // Determinar la quincena actual basada en la fecha de hoy
  const hoy = new Date()
  const diaHoy = hoy.getDate()
  const esPrimeraQuincena = diaHoy <= 15
  const quincenaSeleccionada = params.quincenaSel || (esPrimeraQuincena ? 'primera' : 'segunda')

  // Calcular límites de fecha para la quincena
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth() // 0-indexed
  
  let fechaInicioQ: Date
  let fechaFinQ: Date
  
  if (quincenaSeleccionada === 'primera') {
    fechaInicioQ = new Date(anio, mes, 1)
    fechaFinQ = new Date(anio, mes, 15, 23, 59, 59)
  } else {
    fechaInicioQ = new Date(anio, mes, 16)
    fechaFinQ = endOfMonth(hoy)
  }

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

  // 1. CONSULTAR TODOS LOS MOVIMIENTOS CONTABLES DE INTERÉS
  // =====================================================================
  const { data: movimientos } = await supabase
    .from('movimientos')
    .select('*, comprobantes(*)')

  const todosMovs = movimientos || []

  // 2. CONSULTAR LEADS Y PROVEEDORES PARA MAPEO DE TERCEROS
  const { data: leads } = await supabase.from('leads').select('id, nombre, razon_social')
  const { data: proveedores } = await supabase.from('proveedores').select('id, razon_social')

  const tercerosMap: Record<string, string> = {};
  (leads || []).forEach(l => {
    tercerosMap[l.id] = l.nombre || l.razon_social || 'Cliente';
  });

  (proveedores || []).forEach((p: { id: string, razon_social: string }) => {
    tercerosMap[p.id] = p.razon_social || 'Proveedor';
  });

  // 3. CÁLCULO DE KPIS DE TESORERÍA (CONTROLES DE EFECTIVO)
  // =====================================================================
  
  // Disponible = 111005 + 110505 + 110510 (Débito - Crédito)
  let disponible = 0
  
  // Por cobrar (Bruto) = 130505 (Débito - Crédito)
  let porCobrarBruto = 0
  
  // Provisión acumulada = 139905 (Crédito - Débito)
  let provisionAcumulada = 0
  
  // Por pagar = 220505 + 233525 + 233530 + 233595 (Crédito - Débito)
  let porPagar = 0

  todosMovs.forEach(m => {
    const deb = Number(m.debito || 0)
    const cred = Number(m.credito || 0)

    if (['111005', '110505', '110510'].includes(m.cuenta_codigo)) {
      disponible += (deb - cred)
    } else if (m.cuenta_codigo === '130505') {
      porCobrarBruto += (deb - cred)
    } else if (m.cuenta_codigo === '139905') {
      provisionAcumulada += (cred - deb)
    } else if (['220505', '233525', '233530', '233595'].includes(m.cuenta_codigo)) {
      porPagar += (cred - deb)
    }
  })

  // 4. CÁLCULO DE CUENTAS POR COBRAR (CxC) POR TERCERO (CON SALDO VIVO)
  // =====================================================================
  const cxcPorTercero: Record<string, { totalDebito: number, totalCredito: number, cuenta: string }> = {}
  
  todosMovs.forEach(m => {
    if (m.cuenta_codigo === '130505' && m.tercero_id) {
      if (!cxcPorTercero[m.tercero_id]) {
        cxcPorTercero[m.tercero_id] = { totalDebito: 0, totalCredito: 0, cuenta: '130505' }
      }
      cxcPorTercero[m.tercero_id].totalDebito += Number(m.debito || 0)
      cxcPorTercero[m.tercero_id].totalCredito += Number(m.credito || 0)
    }
  })

  const cxcVivas = Object.entries(cxcPorTercero)
    .map(([terceroId, saldos]) => {
      const saldo = saldos.totalDebito - saldos.totalCredito
      return {
        terceroId,
        nombre: tercerosMap[terceroId] || 'Tercero Desconocido',
        saldo,
        cuenta: saldos.cuenta,
        tipo: 'CxC'
      }
    })
    .filter(item => item.saldo > 0)

  // 5. CÁLCULO DE CUENTAS POR PAGAR (CxP) POR TERCERO (CON SALDO VIVO)
  // =====================================================================
  const cxpPorTercero: Record<string, { totalDebito: number, totalCredito: number, cuenta: string }> = {}
  
  todosMovs.forEach(m => {
    if (['220505', '233525', '233530', '233595'].includes(m.cuenta_codigo) && m.tercero_id) {
      if (!cxpPorTercero[m.tercero_id]) {
        cxpPorTercero[m.tercero_id] = { totalDebito: 0, totalCredito: 0, cuenta: m.cuenta_codigo }
      }
      cxpPorTercero[m.tercero_id].totalDebito += Number(m.debito || 0)
      cxpPorTercero[m.tercero_id].totalCredito += Number(m.credito || 0)
    }
  })

  const cxpVivas = Object.entries(cxpPorTercero)
    .map(([terceroId, saldos]) => {
      const saldo = saldos.totalCredito - saldos.totalDebito
      return {
        terceroId,
        nombre: tercerosMap[terceroId] || 'Tercero Desconocido',
        saldo,
        cuenta: saldos.cuenta,
        tipo: 'CxP'
      }
    })
    .filter(item => item.saldo > 0)

  // Combinar y ordenar por saldo (mayor primero)
  const todasPartidas = [...cxcVivas, ...cxpVivas].sort((a, b) => b.saldo - a.saldo)

  // 6. LÓGICA DE PANELES DE QUINCENA
  // =====================================================================
  
  // A. Falta por cobrar: cotizaciones causadas (cuyo saldo contable es > 0) con valida_hasta dentro de la quincena.
  // Primero consultamos cotizaciones para obtener valida_hasta
  const { data: cotizacionesValidas } = await supabase
    .from('cotizaciones')
    .select('id, numero, total, valida_hasta, lead_id')
    .in('estado', ['aceptada', 'pagada']) // Causadas

  // Filtrar cotizaciones cuyo saldo contable actual es > 0
  const cxcPorCotizacionMap: Record<string, number> = {}
  
  // Agrupar movimientos de la 130505 por origen_id (comprobante -> cotizacion)
  todosMovs.forEach(m => {
    if (m.cuenta_codigo === '130505' && m.comprobantes) {
      const origenId = m.comprobantes.origen_id
      const origenModulo = m.comprobantes.origen_modulo
      
      // La causación suma al débito, los recaudos restan al crédito.
      // Pero los recaudos están en comprobantes con origen_modulo = 'pagos_ventas', por lo que su origen_id es el pago, no la cotización.
      // Así que para saber el saldo de cada cotización, es mejor calcularlo a partir de su saldo en la tabla cotizaciones (total - monto_pagado) o mapearlo.
      // Afortunadamente, en la DB ya tenemos `total` y `monto_pagado` en cotizaciones.
      // El saldo es `total - monto_pagado`.
    }
  })

  // Falta por cobrar: cotizaciones con saldo > 0 y valida_hasta en la quincena seleccionada
  let faltaPorCobrarQuincena = 0
  const listaFaltaPorCobrar: any[] = []



  // Usemos la vista `v_cuentas_por_cobrar` para obtener el saldo real de cada factura y su fecha límite.
  const { data: cuentasXCobrarVista } = await supabase
    .from('v_cuentas_por_cobrar')
    .select('*')

  if (cuentasXCobrarVista) {
    cuentasXCobrarVista.forEach(c => {
      if (c.valida_hasta && c.saldo && c.saldo > 0) {
        const fechaValida = parseISO(c.valida_hasta)
        const enQuincena = fechaValida.getTime() >= fechaInicioQ.getTime() && fechaValida.getTime() <= fechaFinQ.getTime()
        if (enQuincena) {
          faltaPorCobrarQuincena += Number(c.saldo)
          listaFaltaPorCobrar.push({
            id: c.id,
            numero: c.numero,
            cliente: c.razon_social || c.lead_nombre,
            saldo: c.saldo,
            valida_hasta: c.valida_hasta
          })
        }
      }
    })
  }

  // B. Cobrado hasta la quincena: movimientos crédito de 130505 con fecha del comprobante en la quincena
  let cobradoQuincena = 0
  const listaCobrado: any[] = []

  todosMovs.forEach(m => {
    if (m.cuenta_codigo === '130505' && m.credito > 0 && m.comprobantes) {
      const fechaComp = parseISO(m.comprobantes.fecha)
      const enQuincena = fechaComp.getTime() >= fechaInicioQ.getTime() && fechaComp.getTime() <= fechaFinQ.getTime()
      if (enQuincena) {
        cobradoQuincena += Number(m.credito)
        listaCobrado.push({
          id: m.id,
          concepto: m.comprobantes.concepto,
          monto: m.credito,
          fecha: m.comprobantes.fecha,
          tercero: tercerosMap[m.tercero_id || ''] || 'Desconocido'
        })
      }
    }
  })

  // 7. DESGLOSE DETALLADO DE UNA LÍNEA (SI SE HACE CLICK)
  // =====================================================================
  let movimientosDesglose: any[] = []
  if (expandTercero && expandCuenta) {
    movimientosDesglose = todosMovs
      .filter(m => m.tercero_id === expandTercero && m.cuenta_codigo === expandCuenta)
      .sort((a, b) => {
        const dateA = a.comprobantes ? new Date(a.comprobantes.fecha).getTime() : 0
        const dateB = b.comprobantes ? new Date(b.comprobantes.fecha).getTime() : 0
        return dateA - dateB
      })
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-sans font-semibold text-3xl text-[var(--fg)] tracking-tight">
            Tesorería y <em className="font-serif italic font-normal text-[var(--blue)]">Flujos Contables</em>
          </h1>
          <p className="mt-2 text-[var(--fg-dim)] text-[0.92rem]">
            Monitoreo en tiempo real de saldos de efectivo, cuentas por cobrar, provisiones y pagos.
          </p>
        </div>
      </div>

      {/* TARJETAS KPI — CONTROL DE EFECTIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Disponible */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] font-semibold">Efectivo Disponible</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(77,127,255,0.1)] text-[var(--blue)] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-[var(--fg)]">{formatCOP(disponible)}</h3>
            <p className="text-[10px] text-[var(--fg-dim)] mt-1 font-mono uppercase">Caja (1105) + Bancos (1110)</p>
          </div>
        </div>

        {/* Por cobrar bruto */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] font-semibold">Por Cobrar (Bruto)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#4ade80] flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-[#4ade80]">{formatCOP(porCobrarBruto)}</h3>
            <p className="text-[10px] text-[var(--fg-dim)] mt-1 font-mono uppercase">Clientes (130505)</p>
          </div>
        </div>

        {/* Provisión acumulada */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] font-semibold">Provisión Acumulada</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--line-soft)] text-[var(--fg-dim)] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-[var(--fg-dim)]">{formatCOP(provisionAcumulada)}</h3>
            <p className="text-[10px] text-[var(--fg-dim)] mt-1 font-mono uppercase">Reserva Cartera (139905)</p>
          </div>
        </div>

        {/* Por Pagar */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)] font-semibold">Por Pagar</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#f87171] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-[#f87171]">{formatCOP(porPagar)}</h3>
            <p className="text-[10px] text-[var(--fg-dim)] mt-1 font-mono uppercase">Proveedores y Costos (22/23)</p>
          </div>
        </div>
      </div>

      {/* PANELES DE QUINCENA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Panel Quincena selector e info */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif italic text-xl text-[var(--fg)]">Flujo Quincenal</h3>
            <div className="flex rounded-lg border border-[var(--line-soft)] overflow-hidden">
              <Link
                href={`/admin/tesoreria?quincenaSel=primera`}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  quincenaSeleccionada === 'primera'
                    ? 'bg-[var(--blue)] text-white'
                    : 'text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                1 - 15
              </Link>
              <Link
                href={`/admin/tesoreria?quincenaSel=segunda`}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  quincenaSeleccionada === 'segunda'
                    ? 'bg-[var(--blue)] text-white'
                    : 'text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                16 - Fin
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[rgba(248,113,113,0.02)] p-4 rounded-xl border border-red-500/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Falta por Cobrar (Deadline)</span>
              <h4 className="text-xl font-mono font-bold text-[#f87171] mt-2">{formatCOP(faltaPorCobrarQuincena)}</h4>
            </div>
            <div className="bg-[rgba(74,222,128,0.02)] p-4 rounded-xl border border-emerald-500/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-dim)]">Cobrado en la Quincena</span>
              <h4 className="text-xl font-mono font-bold text-[#4ade80] mt-2">{formatCOP(cobradoQuincena)}</h4>
            </div>
          </div>

          <p className="text-[11px] font-mono text-[var(--fg-dim)] uppercase tracking-wider mb-2">
            Período: {format(fechaInicioQ, 'dd MMM', { locale: es })} al {format(fechaFinQ, 'dd MMM, yyyy', { locale: es })}
          </p>
        </div>

        {/* Detalle Cobrado / Falta por cobrar en la quincena */}
        <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif italic text-xl text-[var(--fg)] mb-4">Detalle de Cobros en Quincena</h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {listaCobrado.length > 0 ? (
                listaCobrado.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-[rgba(255,255,255,0.01)] p-2.5 rounded-lg border border-[var(--line-soft)]">
                    <div>
                      <p className="font-medium text-[var(--fg)]">{item.tercero}</p>
                      <p className="text-[10px] text-[var(--fg-dim)] font-mono mt-0.5">{item.fecha}</p>
                    </div>
                    <span className="font-mono text-[#4ade80] font-bold">+{formatCOP(item.monto)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--fg-dim)] italic py-8 text-center">No se registran cobros en esta quincena.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETALLES DE CUENTAS ABIERTAS (TABLA CONTABLE) */}
      <div className="bg-[var(--bg-raise)] border border-[var(--line-soft)] rounded-xl overflow-hidden mb-8">
        <div className="p-4 border-b border-[var(--line-soft)] bg-[rgba(255,255,255,0.01)] flex justify-between items-center">
          <h3 className="font-serif italic text-lg text-[var(--fg)]">Cuentas Abiertas (Saldos por Terceros)</h3>
          <span className="text-[10px] font-mono text-[var(--fg-dim)] uppercase tracking-wider">
            Total Partidas Vivas: {todasPartidas.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[var(--line-soft)] text-[0.72rem] font-mono uppercase tracking-wider text-[var(--fg-dim)]">
              <tr>
                <th className="px-6 py-4 font-medium">Tercero / Razón Social</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Cuenta Contable</th>
                <th className="px-6 py-4 font-medium text-right">Saldo Contable Pendiente</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {todasPartidas.length > 0 ? (
                todasPartidas.map((partida, idx) => {
                  const esCxc = partida.tipo === 'CxC'
                  const estaExpandido = expandTercero === partida.terceroId && expandCuenta === partida.cuenta

                  return (
                    <>
                      <tr key={idx} className="hover:bg-[rgba(255,255,255,0.015)] transition-colors group">
                        <td className="px-6 py-4 font-medium text-[var(--fg)]">
                          {partida.nombre}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[0.7rem] font-mono uppercase tracking-wider ${
                            esCxc 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-[#4ade80]' 
                              : 'bg-red-500/10 border border-red-500/20 text-[#f87171]'
                          }`}>
                            {partida.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {partida.cuenta}
                        </td>
                        <td className={`px-6 py-4 text-right font-mono font-medium ${esCxc ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                          {formatCOP(partida.saldo)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={
                              estaExpandido
                                ? `/admin/tesoreria?quincenaSel=${quincenaSeleccionada}`
                                : `/admin/tesoreria?quincenaSel=${quincenaSeleccionada}&expandTercero=${partida.terceroId}&expandCuenta=${partida.cuenta}`
                            }
                            className="font-mono text-[0.7rem] bg-[var(--blue-dim)] text-[var(--blue)] px-2.5 py-1.5 rounded hover:bg-[var(--blue)] hover:text-white transition-all flex items-center gap-1 inline-flex"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {estaExpandido ? 'Ocultar Asientos' : 'Ver Asientos'}
                          </Link>
                        </td>
                      </tr>

                      {/* DETALLE DESGLOSADO DE ASIENTOS DE LA CUENTA */}
                      {estaExpandido && (
                        <tr>
                          <td colSpan={5} className="bg-[rgba(77,127,255,0.01)] px-8 py-4 border-b border-[var(--line-soft)]">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-dim)]">Trazabilidad del Tercero en cuenta {partida.cuenta}</h4>
                              <Link 
                                href={`/admin/tesoreria?quincenaSel=${quincenaSeleccionada}`}
                                className="text-[var(--fg-dim)] hover:text-[var(--fg)] text-xs flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Cerrar desglose
                              </Link>
                            </div>
                            
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-[var(--line-soft)]/60 text-[var(--fg-dim)] text-[10px] uppercase font-mono">
                                  <th className="py-2 text-left">Fecha</th>
                                  <th className="py-2 text-left">Asiento Contable / Concepto</th>
                                  <th className="py-2 text-right">Débito (D)</th>
                                  <th className="py-2 text-right">Crédito (C)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {movimientosDesglose.length > 0 ? (
                                  movimientosDesglose.map((mov) => (
                                    <tr key={mov.id} className="border-b border-[var(--line-soft)]/20 last:border-b-0">
                                      <td className="py-2 text-[var(--fg-dim)]">
                                        {mov.comprobantes?.fecha}
                                      </td>
                                      <td className="py-2 font-medium text-[var(--fg)]">
                                        {mov.comprobantes?.concepto}
                                        <span className="ml-2 font-mono text-[9px] bg-[rgba(255,255,255,0.03)] text-[var(--fg-dim)] px-1.5 py-0.5 rounded">
                                          {mov.comprobantes?.tipo}
                                        </span>
                                      </td>
                                      <td className="py-2 text-right font-mono">
                                        {mov.debito > 0 ? formatCOP(mov.debito) : '—'}
                                      </td>
                                      <td className="py-2 text-right font-mono">
                                        {mov.credito > 0 ? formatCOP(mov.credito) : '—'}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="py-4 text-center italic text-[var(--fg-dim)]">
                                      No se registran asientos en la cuenta para este tercero.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--fg-dim)] italic">
                    No hay cuentas contables abiertas pendientes de recaudo o pago.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
