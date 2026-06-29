'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function crearProveedor(formData: FormData) {
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

    const razon_social = formData.get('razon_social') as string
    const contacto_nombre = formData.get('contacto_nombre') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const tipo_documento = formData.get('tipo_documento') as string
    const numero_documento = formData.get('numero_documento') as string
    const direccion = formData.get('direccion') as string
    const categoria = formData.get('categoria') as string
    
    if (!razon_social) {
      return { ok: false, error: 'La razón social es obligatoria' }
    }

    const { error } = await supabase.from('proveedores').insert({
      razon_social,
      contacto_nombre: contacto_nombre || null,
      email: email || null,
      telefono: telefono || null,
      tipo_documento: tipo_documento || null,
      numero_documento: numero_documento || null,
      direccion: direccion || null,
      categoria: categoria || null,
      activo: true
    })

    if (error) throw error

    revalidatePath('/admin/proveedores')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al crear proveedor:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function actualizarProveedor(id: string, formData: FormData) {
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

    const razon_social = formData.get('razon_social') as string
    const contacto_nombre = formData.get('contacto_nombre') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const tipo_documento = formData.get('tipo_documento') as string
    const numero_documento = formData.get('numero_documento') as string
    const direccion = formData.get('direccion') as string
    const categoria = formData.get('categoria') as string
    
    if (!razon_social) {
      return { ok: false, error: 'La razón social es obligatoria' }
    }

    const { error } = await supabase.from('proveedores').update({
      razon_social,
      contacto_nombre: contacto_nombre || null,
      email: email || null,
      telefono: telefono || null,
      tipo_documento: tipo_documento || null,
      numero_documento: numero_documento || null,
      direccion: direccion || null,
      categoria: categoria || null
    }).eq('id', id)

    if (error) throw error

    revalidatePath('/admin/proveedores')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al actualizar proveedor:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
