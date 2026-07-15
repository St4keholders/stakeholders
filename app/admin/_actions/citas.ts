'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function crearCita(formData: FormData) {
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

    const nombre = formData.get('nombre') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const fecha = formData.get('fecha') as string
    const hora = formData.get('hora') as string

    if (!nombre || !fecha || !hora) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    const { error } = await supabase.from('consultas').insert({
      nombre,
      email,
      telefono,
      fecha_consulta: fecha,
      hora_consulta: hora,
      estado: 'pendiente'
    })

    if (error) throw error

    revalidatePath('/admin/citas')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al crear cita:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
export async function actualizarCita(id: string, formData: FormData) {
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

    if (!estado) {
      return { ok: false, error: 'Faltan campos obligatorios' }
    }

    const { error } = await supabase
      .from('consultas')
      .update({ estado })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/citas')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al actualizar cita:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}

export async function eliminarCita(id: string) {
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

    const { error } = await supabase.from('consultas').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/citas')
    revalidatePath('/admin/inicio')
    return { ok: true }
  } catch (err: any) {
    console.error('Error al eliminar cita:', err)
    return { ok: false, error: err.message || 'Error interno' }
  }
}
