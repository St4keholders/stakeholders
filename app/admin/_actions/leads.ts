'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function crearLead(formData: FormData) {
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

    const nombre = formData.get('nombre') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const tipo_documento = formData.get('tipo_documento') as string
    const numero_documento = formData.get('numero_documento') as string
    const razon_social = formData.get('razon_social') as string
    const direccion = formData.get('direccion') as string
    
    if (!nombre) {
      return { ok: false, error: 'El nombre es obligatorio' }
    }

    const { error } = await supabase.from('leads').insert({
      nombre,
      email: email || null,
      telefono: telefono || null,
      tipo_documento: tipo_documento || null,
      numero_documento: numero_documento || null,
      razon_social: razon_social || null,
      direccion: direccion || null,
      estado: 'nuevo',
      total_citas: 0,
      total_cotizaciones: 0
    })

    if (error) throw error

    revalidatePath('/admin/leads')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al crear lead:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function actualizarLead(id: string, formData: FormData) {
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

    const nombre = formData.get('nombre') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const tipo_documento = formData.get('tipo_documento') as string
    const numero_documento = formData.get('numero_documento') as string
    const razon_social = formData.get('razon_social') as string
    const direccion = formData.get('direccion') as string
    
    if (!nombre) {
      return { ok: false, error: 'El nombre es obligatorio' }
    }

    const { error } = await supabase.from('leads').update({
      nombre,
      email: email || null,
      telefono: telefono || null,
      tipo_documento: tipo_documento || null,
      numero_documento: numero_documento || null,
      razon_social: razon_social || null,
      direccion: direccion || null
    }).eq('id', id)

    if (error) throw error

    revalidatePath('/admin/leads')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al actualizar lead:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function eliminarLead(id: string) {
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

    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        return { ok: false, error: 'No se puede eliminar este lead porque tiene citas o cotizaciones asociadas.' }
      }
      throw error
    }

    revalidatePath('/admin/leads')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al eliminar lead:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
