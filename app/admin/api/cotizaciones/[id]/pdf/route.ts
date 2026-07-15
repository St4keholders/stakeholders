import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCotizacionStream } from './CotizacionDocument'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .select('*, leads(*), cotizacion_items(*)')
      .eq('id', id)
      .single()

    if (error || !cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    const stream = await getCotizacionStream(cotizacion)
    
    // Transform NodeJS ReadableStream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: any) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err: any) => controller.error(err))
      }
    })

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cotizacion.numero}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error('Error generando PDF:', err)
    return NextResponse.json({ error: 'Error interno generando PDF' }, { status: 500 })
  }
}
