'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function registrarCompra(formData: FormData) {
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

    const proveedorNombre = formData.get('proveedor') as string
    const fecha = formData.get('fecha') as string
    const refExterna = formData.get('ref_externa') as string
    const totalStr = formData.get('total') as string
    const concepto = formData.get('concepto') as string

    if (!proveedorNombre || !fecha || !totalStr) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    const total = parseFloat(totalStr)
    
    // 1. Buscar o crear el proveedor
    let proveedorId = ''
    const { data: provs } = await supabase
      .from('proveedores')
      .select('id')
      .ilike('razon_social', proveedorNombre)
      .limit(1)

    if (provs && provs.length > 0) {
      proveedorId = provs[0].id
    } else {
      const { data: newProv, error: errProv } = await supabase
        .from('proveedores')
        .insert({
          razon_social: proveedorNombre,
          activo: true
        })
        .select('id')
        .single()
        
      if (errProv) throw errProv
      proveedorId = newProv.id
    }

    // 2. Generar numero C-YYYY-NNNN
    // Para simplificar, le asignamos un timestamp como numero único o hacemos un count
    const anio = new Date().getFullYear()
    const { count } = await supabase
      .from('compras')
      .select('*', { count: 'exact', head: true })
      
    const seq = (count || 0) + 1
    const numero = `C-${anio}-${seq.toString().padStart(4, '0')}`

    const fecha_vencimiento = formData.get('fecha_vencimiento') as string

    // 3. Crear la compra
    const { error: errCompra } = await supabase.from('compras').insert({
      numero,
      proveedor_id: proveedorId,
      fecha_factura: fecha,
      fecha_vencimiento: fecha_vencimiento || null,
      ref_externa: refExterna || null,
      concepto: concepto || 'Compra general',
      subtotal: total, // Simplificado, sin calcular retenciones para el MVP
      iva_total: 0,
      retencion_total: 0,
      total: total,
      monto_pagado: 0,
      estado: 'pendiente',
      cuenta_gasto: formData.get('cuenta_gasto') as string || '615540',
      cuenta_contrapartida: formData.get('cuenta_contrapartida') as string || '220505'
    })

    if (errCompra) throw errCompra

    revalidatePath('/admin/compras')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al registrar compra:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function actualizarCompra(id: string, formData: FormData) {
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
    const fecha_vencimiento = formData.get('fecha_vencimiento') as string

    const updateFields: any = {
      fecha_vencimiento: fecha_vencimiento || null
    }

    if (estado) {
      updateFields.estado = estado
    }

    const { error } = await supabase
      .from('compras')
      .update(updateFields)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/compras')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al actualizar compra:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function eliminarCompra(id: string) {
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

    const { error } = await supabase.from('compras').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/compras')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al eliminar compra:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function registrarPagoCompra(compraId: string, formData: FormData) {
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

    // 1. Obtener la compra para saber su total y estado actual
    const { data: comp, error: errComp } = await supabase
      .from('compras')
      .select('total, estado')
      .eq('id', compraId)
      .single()

    if (errComp || !comp) throw errComp || new Error('No se encontró la compra')

    // 2. Insertar el pago
    const { error: errPago } = await supabase
      .from('pagos_compras')
      .insert({
        compra_id: compraId,
        fecha,
        monto,
        metodo,
        referencia: referencia || null,
        notas: notas || null
      })

    if (errPago) throw errPago

    // 3. Sumar todos los pagos para recalcular monto_pagado
    const { data: pagos } = await supabase
      .from('pagos_compras')
      .select('monto')
      .eq('compra_id', compraId)

    const totalPagado = pagos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

    // 4. Actualizar la compra con el nuevo monto_pagado y estado
    const nuevoEstado = totalPagado >= comp.total ? 'pagada' : 'pendiente'

    const { error: errUpdate } = await supabase
      .from('compras')
      .update({
        monto_pagado: totalPagado,
        estado: nuevoEstado
      })
      .eq('id', compraId)

    if (errUpdate) throw errUpdate

    revalidatePath('/admin/compras')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    revalidatePath('/admin/contabilidad')

    return { ok: true }
  } catch (err: any) {
    console.error('Error al registrar pago compra:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function eliminarPagoCompra(pagoId: string, compraId: string) {
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

    // 1. Obtener la compra para saber su total
    const { data: comp, error: errComp } = await supabase
      .from('compras')
      .select('total')
      .eq('id', compraId)
      .single()

    if (errComp || !comp) throw errComp || new Error('No se encontró la compra')

    // 2. Eliminar el pago
    const { error: errDelete } = await supabase
      .from('pagos_compras')
      .delete()
      .eq('id', pagoId)

    if (errDelete) throw errDelete

    // 3. Sumar pagos restantes
    const { data: pagos } = await supabase
      .from('pagos_compras')
      .select('monto')
      .eq('compra_id', compraId)

    const totalPagado = pagos?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

    // 4. Si los pagos restantes son menores al total, y estaba pagada, vuelve a 'pendiente'
    const nuevoEstado = totalPagado >= comp.total ? 'pagada' : 'pendiente'

    const { error: errUpdate } = await supabase
      .from('compras')
      .update({
        monto_pagado: totalPagado,
        estado: nuevoEstado
      })
      .eq('id', compraId)

    if (errUpdate) throw errUpdate

    revalidatePath('/admin/compras')
    revalidatePath('/admin/tesoreria')
    revalidatePath('/admin/inicio')
    revalidatePath('/admin/contabilidad')

    return { ok: true }
  } catch (err: any) {
    console.error('Error al eliminar pago compra:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
