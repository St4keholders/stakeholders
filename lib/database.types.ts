export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      compra_items: {
        Row: {
          cantidad: number
          compra_id: string
          created_at: string
          descripcion: string
          id: string
          iva_pct: number
          orden: number
          precio_unitario: number
          retencion_pct: number
          subtotal: number
        }
        Insert: {
          cantidad?: number
          compra_id: string
          created_at?: string
          descripcion: string
          id?: string
          iva_pct?: number
          orden?: number
          precio_unitario?: number
          retencion_pct?: number
          subtotal?: number
        }
        Update: {
          cantidad?: number
          compra_id?: string
          created_at?: string
          descripcion?: string
          id?: string
          iva_pct?: number
          orden?: number
          precio_unitario?: number
          retencion_pct?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "compra_items_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compra_items_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_por_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          archivo_url: string | null
          concepto: string | null
          created_at: string
          cuenta_contrapartida: string | null
          cuenta_gasto: string | null
          estado: string
          fecha_factura: string
          fecha_vencimiento: string | null
          id: string
          iva_total: number
          monto_pagado: number
          notas: string | null
          numero: string
          pagada_at: string | null
          proveedor_id: string
          ref_externa: string | null
          registrado_por: string | null
          retencion_total: number
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          archivo_url?: string | null
          concepto?: string | null
          created_at?: string
          cuenta_contrapartida?: string | null
          cuenta_gasto?: string | null
          estado?: string
          fecha_factura?: string
          fecha_vencimiento?: string | null
          id?: string
          iva_total?: number
          monto_pagado?: number
          notas?: string | null
          numero: string
          pagada_at?: string | null
          proveedor_id: string
          ref_externa?: string | null
          registrado_por?: string | null
          retencion_total?: number
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          archivo_url?: string | null
          concepto?: string | null
          created_at?: string
          cuenta_contrapartida?: string | null
          cuenta_gasto?: string | null
          estado?: string
          fecha_factura?: string
          fecha_vencimiento?: string | null
          id?: string
          iva_total?: number
          monto_pagado?: number
          notas?: string | null
          numero?: string
          pagada_at?: string | null
          proveedor_id?: string
          ref_externa?: string | null
          registrado_por?: string | null
          retencion_total?: number
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_cuenta_contrapartida_fkey"
            columns: ["cuenta_contrapartida"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "compras_cuenta_gasto_fkey"
            columns: ["cuenta_gasto"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "compras_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comprobantes: {
        Row: {
          concepto: string
          created_at: string
          fecha: string
          id: string
          origen_id: string | null
          origen_modulo: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          concepto: string
          created_at?: string
          fecha: string
          id?: string
          origen_id?: string | null
          origen_modulo?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          concepto?: string
          created_at?: string
          fecha?: string
          id?: string
          origen_id?: string | null
          origen_modulo?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          atendida_por: string | null
          created_at: string
          email: string
          estado: string
          fecha_consulta: string
          hora_consulta: string
          id: string
          lead_id: string | null
          nombre: string | null
          notas: string | null
          telefono: string
        }
        Insert: {
          atendida_por?: string | null
          created_at?: string
          email: string
          estado?: string
          fecha_consulta: string
          hora_consulta: string
          id?: string
          lead_id?: string | null
          nombre?: string | null
          notas?: string | null
          telefono: string
        }
        Update: {
          atendida_por?: string | null
          created_at?: string
          email?: string
          estado?: string
          fecha_consulta?: string
          hora_consulta?: string
          id?: string
          lead_id?: string | null
          nombre?: string | null
          notes?: string | null
          notas?: string | null
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_atendida_por_fkey"
            columns: ["atendida_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_items: {
        Row: {
          cantidad: number
          cotizacion_id: string
          created_at: string
          descripcion: string
          descuento_pct: number
          id: string
          iva_pct: number
          orden: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          cantidad?: number
          cotizacion_id: string
          created_at?: string
          descripcion: string
          descuento_pct?: number
          id?: string
          iva_pct?: number
          orden?: number
          precio_unitario?: number
          subtotal?: number
        }
        Update: {
          cantidad?: number
          cotizacion_id?: string
          created_at?: string
          descripcion?: string
          descuento_pct?: number
          id?: string
          iva_pct?: number
          orden?: number
          precio_unitario?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_por_cobrar"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          aceptada_at: string | null
          cliente_snapshot: Json | null
          condiciones: string | null
          created_at: string
          cuenta_ingreso: string | null
          descuento_total: number
          enviada_at: string | null
          estado: string
          fecha_emision: string
          id: string
          iva_total: number
          lead_id: string
          moneda: string
          monto_pagado: number
          notas: string | null
          numero: string
          pagada_at: string | null
          rechazada_at: string | null
          subtotal: number
          total: number
          updated_at: string
          valida_hasta: string | null
          vendedor_id: string | null
        }
        Insert: {
          aceptada_at?: string | null
          cliente_snapshot?: Json | null
          condiciones?: string | null
          created_at?: string
          cuenta_ingreso?: string | null
          descuento_total?: number
          enviada_at?: string | null
          estado?: string
          fecha_emision?: string
          id?: string
          iva_total?: number
          lead_id: string
          moneda?: string
          monto_pagado?: number
          notas?: string | null
          numero: string
          pagada_at?: string | null
          rechazada_at?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          valida_hasta?: string | null
          vendedor_id?: string | null
        }
        Update: {
          aceptada_at?: string | null
          cliente_snapshot?: Json | null
          condiciones?: string | null
          created_at?: string
          cuenta_ingreso?: string | null
          descuento_total?: number
          enviada_at?: string | null
          estado?: string
          fecha_emision?: string
          id?: string
          iva_total?: number
          lead_id?: string
          moneda?: string
          monto_pagado?: number
          notas?: string | null
          numero?: string
          pagada_at?: string | null
          rechazada_at?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          valida_hasta?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cuenta_ingreso_fkey"
            columns: ["cuenta_ingreso"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "cotizaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas: {
        Row: {
          activo: boolean
          codigo: string
          naturaleza: string
          nombre: string
          tipo: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          naturaleza: string
          nombre: string
          tipo: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          naturaleza?: string
          nombre?: string
          tipo?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ciudad: string | null
          created_at: string
          departamento: string | null
          direccion: string | null
          email: string | null
          estado: string
          id: string
          nombre: string | null
          notas: string | null
          numero_documento: string | null
          origen: string | null
          razon_social: string | null
          telefono: string | null
          tipo_documento: string | null
          total_citas: number
          total_cotizaciones: number
          ultima_cita_at: string | null
          ultima_cotizacion_at: string | null
          updated_at: string
        }
        Insert: {
          ciudad?: string | null
          created_at?: string
          departamento?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string
          id?: string
          nombre?: string | null
          notas?: string | null
          numero_documento?: string | null
          origen?: string | null
          razon_social?: string | null
          telefono?: string | null
          tipo_documento?: string | null
          total_citas?: number
          total_cotizaciones?: number
          ultima_cita_at?: string | null
          ultima_cotizacion_at?: string | null
          updated_at?: string
        }
        Update: {
          ciudad?: string | null
          created_at?: string
          departamento?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string
          id?: string
          nombre?: string | null
          notas?: string | null
          numero_documento?: string | null
          origen?: string | null
          razon_social?: string | null
          telefono?: string | null
          tipo_documento?: string | null
          total_citas?: number
          total_cotizaciones?: number
          ultima_cita_at?: string | null
          ultima_cotizacion_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      movimientos: {
        Row: {
          comprobante_id: string
          created_at: string
          credito: number
          cuenta_codigo: string
          debito: number
          id: string
          tercero_id: string | null
        }
        Insert: {
          comprobante_id: string
          created_at?: string
          credito?: number
          cuenta_codigo: string
          debito?: number
          id?: string
          tercero_id?: string | null
        }
        Update: {
          comprobante_id?: string
          created_at?: string
          credito?: number
          cuenta_codigo?: string
          debito?: number
          id?: string
          tercero_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_comprobante_id_fkey"
            columns: ["comprobante_id"]
            isOneToOne: false
            referencedRelation: "comprobantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_cuenta_codigo_fkey"
            columns: ["cuenta_codigo"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["codigo"]
          },
        ]
      }
      pagos_compras: {
        Row: {
          compra_id: string
          created_at: string
          fecha: string
          id: string
          metodo: string | null
          monto: number
          notas: string | null
          referencia: string | null
          registrado_por: string | null
        }
        Insert: {
          compra_id: string
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string | null
          monto: number
          notas?: string | null
          referencia?: string | null
          registrado_por?: string | null
        }
        Update: {
          compra_id?: string
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string | null
          monto?: number
          notas?: string | null
          referencia?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_compras_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_compras_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_por_pagar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_compras_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_cotizaciones: {
        Row: {
          cotizacion_id: string
          created_at: string
          fecha: string
          id: string
          metodo: string | null
          monto: number
          notas: string | null
          referencia: string | null
          registrado_por: string | null
        }
        Insert: {
          cotizacion_id: string
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string | null
          monto: number
          notas?: string | null
          referencia?: string | null
          registrado_por?: string | null
        }
        Update: {
          cotizacion_id?: string
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string | null
          monto?: number
          notas?: string | null
          referencia?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_cotizaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cotizaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_por_cobrar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cotizaciones_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          activo: boolean
          categoria: string | null
          ciudad: string | null
          contacto_nombre: string | null
          created_at: string
          departamento: string | null
          direccion: string | null
          email: string | null
          id: string
          notas: string | null
          numero_documento: string | null
          razon_social: string
          telefono: string | null
          tipo_documento: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          ciudad?: string | null
          contacto_nombre?: string | null
          created_at?: string
          departamento?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          notas?: string | null
          numero_documento?: string | null
          razon_social: string
          telefono?: string | null
          tipo_documento?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          ciudad?: string | null
          contacto_nombre?: string | null
          created_at?: string
          departamento?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          notas?: string | null
          numero_documento?: string | null
          razon_social?: string
          telefono?: string | null
          tipo_documento?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          nombre: string
          role: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id: string
          nombre: string
          role?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_cuentas_por_cobrar: {
        Row: {
          aceptada_at: string | null
          bucket_antiguedad: string | null
          dias_pendiente: number | null
          id: string | null
          lead_id: string | null
          lead_nombre: string | null
          monto_pagado: number | null
          numero: string | null
          razon_social: string | null
          saldo: number | null
          total: number | null
          valida_hasta: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cuentas_por_pagar: {
        Row: {
          bucket_antiguedad: string | null
          dias_pendiente: number | null
          fecha_factura: string | null
          fecha_vencimiento: string | null
          id: string | null
          monto_pagado: number | null
          numero: string | null
          proveedor: string | null
          proveedor_id: string | null
          ref_externa: string | null
          saldo: number | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      v_dpo: {
        Row: {
          dpo_dias: number | null
          muestras: number | null
        }
        Relationships: []
      }
      v_dso: {
        Row: {
          dso_dias: number | null
          muestras: number | null
        }
        Relationships: []
      }
      v_flujo_diario: {
        Row: {
          costos: number | null
          dia: string | null
          ingresos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_authed: { Args: never; Returns: boolean }
      next_correlativo: {
        Args: { p_prefijo: string; p_tabla: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
