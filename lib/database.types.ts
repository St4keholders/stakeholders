export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string
          role: 'admin' | 'vendedor'
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre: string
          role?: 'admin' | 'vendedor'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          role?: 'admin' | 'vendedor'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          nombre: string | null
          email: string | null
          telefono: string | null
          tipo_documento: 'CC' | 'NIT' | 'CE' | 'PP' | 'TI' | null
          numero_documento: string | null
          razon_social: string | null
          direccion: string | null
          ciudad: string | null
          departamento: string | null
          estado: 'nuevo' | 'contactado' | 'cotizado' | 'ganado' | 'perdido' | 'frio'
          origen: string | null
          notas: string | null
          total_citas: number
          ultima_cita_at: string | null
          total_cotizaciones: number
          ultima_cotizacion_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre?: string | null
          email?: string | null
          telefono?: string | null
          tipo_documento?: 'CC' | 'NIT' | 'CE' | 'PP' | 'TI' | null
          numero_documento?: string | null
          razon_social?: string | null
          direccion?: string | null
          ciudad?: string | null
          departamento?: string | null
          estado?: 'nuevo' | 'contactado' | 'cotizado' | 'ganado' | 'perdido' | 'frio'
          origen?: string | null
          notas?: string | null
          total_citas?: number
          ultima_cita_at?: string | null
          total_cotizaciones?: number
          ultima_cotizacion_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          [key: string]: any
        }
      }
      consultas: {
        Row: {
          id: string
          created_at: string
          fecha_consulta: string
          hora_consulta: string
          telefono: string | null
          email: string | null
          estado: 'pendiente' | 'atendida' | 'cancelada' | 'no_asistio'
          nombre: string | null
          lead_id: string | null
          notas: string | null
          atendida_por: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      proveedores: {
        Row: {
          id: string
          razon_social: string
          tipo_documento: 'CC' | 'NIT' | 'CE' | null
          numero_documento: string | null
          contacto_nombre: string | null
          email: string | null
          telefono: string | null
          direccion: string | null
          ciudad: string | null
          departamento: string | null
          categoria: string | null
          activo: boolean
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      cotizaciones: {
        Row: {
          id: string
          numero: string
          lead_id: string
          vendedor_id: string | null
          fecha_emision: string
          valida_hasta: string | null
          subtotal: number
          descuento_total: number
          iva_total: number
          total: number
          monto_pagado: number
          moneda: string
          estado: 'borrador' | 'enviada' | 'aceptada' | 'pagada' | 'rechazada' | 'vencida'
          cliente_snapshot: Json | null
          notas: string | null
          condiciones: string | null
          enviada_at: string | null
          aceptada_at: string | null
          pagada_at: string | null
          rechazada_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      cotizacion_items: {
        Row: {
          id: string
          cotizacion_id: string
          orden: number
          descripcion: string
          cantidad: number
          precio_unitario: number
          descuento_pct: number
          iva_pct: number
          subtotal: number
          created_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      pagos_cotizaciones: {
        Row: {
          id: string
          cotizacion_id: string
          fecha: string
          monto: number
          metodo: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro' | null
          referencia: string | null
          notas: string | null
          registrado_por: string | null
          created_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      compras: {
        Row: {
          id: string
          numero: string
          proveedor_id: string
          registrado_por: string | null
          ref_externa: string | null
          fecha_factura: string
          fecha_vencimiento: string | null
          subtotal: number
          iva_total: number
          retencion_total: number
          total: number
          monto_pagado: number
          estado: 'pendiente' | 'pagada' | 'anulada'
          concepto: string | null
          archivo_url: string | null
          notas: string | null
          pagada_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      compra_items: {
        Row: {
          id: string
          compra_id: string
          orden: number
          descripcion: string
          cantidad: number
          precio_unitario: number
          iva_pct: number
          retencion_pct: number
          subtotal: number
          created_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      pagos_compras: {
        Row: {
          id: string
          compra_id: string
          fecha: string
          monto: number
          metodo: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro' | null
          referencia: string | null
          notas: string | null
          registrado_por: string | null
          created_at: string
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
    }
    Views: {
      v_cuentas_por_cobrar: {
        Row: {
          id: string
          numero: string
          lead_id: string
          razon_social: string | null
          lead_nombre: string | null
          total: number
          monto_pagado: number
          saldo: number
          aceptada_at: string | null
          valida_hasta: string | null
          dias_pendiente: number
          bucket_antiguedad: string
        }
      }
      v_cuentas_por_pagar: {
        Row: {
          id: string
          numero: string
          ref_externa: string | null
          proveedor_id: string
          proveedor: string | null
          total: number
          monto_pagado: number
          saldo: number
          fecha_factura: string
          fecha_vencimiento: string | null
          dias_pendiente: number
          bucket_antiguedad: string
        }
      }
      v_dso: {
        Row: {
          dso_dias: number
          muestras: number
        }
      }
      v_dpo: {
        Row: {
          dpo_dias: number
          muestras: number
        }
      }
      v_flujo_diario: {
        Row: {
          dia: string
          ingresos: number
          costos: number
        }
      }
    }
    Functions: {
      [key: string]: any
    }
  }
}
