'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function crearCotizacion(formData: FormData) {
  try {
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

    const clienteNombre = formData.get('cliente') as string
    const fecha = formData.get('fecha') as string
    const itemsStr = formData.get('items') as string
    const notas = formData.get('notas') as string

    if (!clienteNombre || !fecha || !itemsStr) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    let items: any[] = []
    try {
      items = JSON.parse(itemsStr)
    } catch (e) {
      return { ok: false, error: 'Los ítems de la cotización tienen un formato inválido' }
    }

    if (items.length === 0) {
      return { ok: false, error: 'Debes agregar al menos un ítem o servicio a la cotización' }
    }

    // Validar y calcular total
    let totalCalculado = 0
    for (const item of items) {
      const cantidad = parseFloat(item.cantidad)
      const precio = parseFloat(item.precio_unitario)
      if (isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio < 0 || !item.descripcion) {
        return { ok: false, error: 'Cada ítem debe tener descripción, cantidad y precio válidos' }
      }
      totalCalculado += cantidad * precio
    }
    
    // 1. Buscar o crear el lead (cliente)
    let leadId = ''
    const { data: leads } = await supabase
      .from('leads')
      .select('id')
      .ilike('nombre', clienteNombre)
      .limit(1)

    if (leads && leads.length > 0) {
      leadId = leads[0].id
    } else {
      const { data: newLead, error: errLead } = await supabase
        .from('leads')
        .insert({
          nombre: clienteNombre,
          estado: 'nuevo',
          total_citas: 0,
          total_cotizaciones: 0
        })
        .select('id')
        .single()
        
      if (errLead) throw errLead
      leadId = newLead.id
    }

    // 2. Generar numero SH-YYYY-NNNN
    const anio = new Date().getFullYear()
    const { count } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      
    const seq = (count || 0) + 1
    const numero = `SH-${anio}-${seq.toString().padStart(4, '0')}`

    const valida_hasta = formData.get('valida_hasta') as string

    // 3. Crear la cotizacion
    const { data: newVenta, error: errVenta } = await supabase
      .from('cotizaciones')
      .insert({
        numero,
        lead_id: leadId,
        fecha_emision: fecha,
        valida_hasta: valida_hasta || null,
        subtotal: totalCalculado, 
        descuento_total: 0,
        iva_total: 0,
        total: totalCalculado,
        monto_pagado: 0,
        estado: 'borrador',
        moneda: 'COP',
        notas: notas || '',
        cuenta_ingreso: formData.get('cuenta_ingreso') as string || '415515'
      })
      .select('id')
      .single()

    if (errVenta || !newVenta) throw errVenta || new Error('No se pudo crear la cotización')

    // 4. Crear los ítems de la cotización
    const lineas = items.map((item: any, index: number) => ({
      cotizacion_id: newVenta.id,
      orden: index,
      descripcion: item.descripcion,
      cantidad: parseFloat(item.cantidad),
      precio_unitario: parseFloat(item.precio_unitario),
      descuento_pct: 0,
      iva_pct: 0,
      subtotal: parseFloat(item.cantidad) * parseFloat(item.precio_unitario)
    }))

    const { error: errItems } = await supabase
      .from('cotizacion_items')
      .insert(lineas)

    if (errItems) throw errItems

    revalidatePath('/admin/ventas')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al registrar cotizacion:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function actualizarCotizacion(id: string, formData: FormData) {
  try {
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

    const estado = formData.get('estado') as string
    const valida_hasta = formData.get('valida_hasta') as string

    if (!estado) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    const { error } = await supabase
      .from('cotizaciones')
      .update({ 
        estado,
        valida_hasta: valida_hasta || null
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/ventas')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al actualizar cotizacion:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function eliminarCotizacion(id: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
        },
      }
    )

    const { error } = await supabase.from('cotizaciones').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        return { ok: false, error: 'No se puede eliminar esta cotización porque tiene pagos registrados.' }
      }
      throw error
    }

    revalidatePath('/admin/ventas')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al eliminar cotizacion:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function registrarPagoCotizacion(cotizacionId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
        },
      }
    )

    const fecha = formData.get('fecha') as string
    const montoStr = formData.get('monto') as string
    const metodo = formData.get('metodo') as string
    const referencia = formData.get('referencia') as string
    const notas = formData.get('notes') as string || formData.get('notas') as string

    if (!fecha || !montoStr || !metodo) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    const monto = parseFloat(montoStr)
    if (isNaN(monto) || monto <= 0) {
      return { ok: false, error: 'El monto debe ser mayor a 0' }
    }

    // 1. Obtener la cotización para saber su total
    const { data: cot, error: errCot } = await supabase
      .from('cotizaciones')
      .select('total, estado')
      .eq('id', cotizacionId)
      .single()

    if (errCot || !cot) throw errCot || new Error('No se encontró la cotización')

    // 2. Insertar el pago
    const { error: errPago } = await supabase
      .from('pagos_cotizaciones')
      .insert({
        cotizacion_id: cotizacionId,
        fecha,
        monto,
        metodo,
        referencia: referencia || null,
        notas: notas || null
      })

    if (errPago) throw errPago

    // 3. Sumar todos los pagos para recalcular monto_pagado
    const { data: pagos } = await supabase
      .from('pagos_cotizaciones')
      .select('monto')
      .eq('cotizacion_id', cotizacionId)

    const totalPagado = pagos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

    // 4. Actualizar la cotización con el nuevo monto_pagado y estado
    const nuevoEstado = totalPagado >= cot.total ? 'pagada' : 'aceptada'

    const { error: errUpdate } = await supabase
      .from('cotizaciones')
      .update({
        monto_pagado: totalPagado,
        estado: nuevoEstado
      })
      .eq('id', cotizacionId)

    if (errUpdate) throw errUpdate

    revalidatePath('/admin/ventas')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    revalidatePath('/admin/contabilidad')

    return { ok: true }
  } catch (err: any) {
    console.error('Error al registrar pago cotización:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function eliminarPagoCotizacion(pagoId: string, cotizacionId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
        },
      }
    )

    // 1. Obtener la cotización para saber su total
    const { data: cot, error: errCot } = await supabase
      .from('cotizaciones')
      .select('total')
      .eq('id', cotizacionId)
      .single()

    if (errCot || !cot) throw errCot || new Error('No se encontró la cotización')

    // 2. Eliminar el pago
    const { error: errDelete } = await supabase
      .from('pagos_cotizaciones')
      .delete()
      .eq('id', pagoId)

    if (errDelete) throw errDelete

    // 3. Sumar pagos restantes
    const { data: pagos } = await supabase
      .from('pagos_cotizaciones')
      .select('monto')
      .eq('cotizacion_id', cotizacionId)

    const totalPagado = pagos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

    // 4. Si los pagos restantes son menores al total, y estaba pagada, vuelve a 'aceptada'
    const nuevoEstado = totalPagado >= cot.total ? 'pagada' : 'aceptada'

    const { error: errUpdate } = await supabase
      .from('cotizaciones')
      .update({
        monto_pagado: totalPagado,
        estado: nuevoEstado
      })
      .eq('id', cotizacionId)

    if (errUpdate) throw errUpdate

    revalidatePath('/admin/ventas')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    revalidatePath('/admin/contabilidad')

    return { ok: true }
  } catch (err: any) {
    console.error('Error al eliminar pago cotización:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
