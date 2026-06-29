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
    const totalStr = formData.get('total') as string
    const notas = formData.get('notas') as string

    if (!clienteNombre || !fecha || !totalStr) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    const total = parseFloat(totalStr)
    
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

    // 3. Crear la cotizacion
    const { error: errVenta } = await supabase.from('cotizaciones').insert({
      numero,
      lead_id: leadId,
      fecha_emision: fecha,
      subtotal: total, 
      descuento_total: 0,
      iva_total: 0,
      total: total,
      monto_pagado: 0,
      estado: 'borrador',
      moneda: 'COP',
      notas: notas || ''
    })

    if (errVenta) throw errVenta

    revalidatePath('/admin/ventas')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al registrar cotizacion:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
