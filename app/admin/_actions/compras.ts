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

    // 3. Crear la compra
    const { error: errCompra } = await supabase.from('compras').insert({
      numero,
      proveedor_id: proveedorId,
      fecha_factura: fecha,
      ref_externa: refExterna || null,
      concepto: concepto || 'Compra general',
      subtotal: total, // Simplificado, sin calcular retenciones para el MVP
      iva_total: 0,
      retencion_total: 0,
      total: total,
      monto_pagado: 0,
      estado: 'pendiente'
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
