import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  title: {
    fontSize: 20,
    color: '#3d6fe5',
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  infoBlock: {
    width: '45%',
  },
  infoTitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 2,
  },
  table: {
    width: '100%',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #f3f4f6',
    paddingVertical: 8,
  },
  colConcepto: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  textHeader: { fontSize: 10, color: '#6b7280', fontWeight: 'bold' },
  textCell: { fontSize: 11, color: '#374151' },
  totalsBlock: {
    alignSelf: 'flex-end',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalText: { fontSize: 11, color: '#374151' },
  totalTextBold: { fontSize: 14, color: '#111827', fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
  }
})

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(n || 0)
}

export const CotizacionDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>ST4KEHOLDERS</Text>
          <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Agencia Digital & Consultoría</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.title}>COTIZACIÓN</Text>
          <Text style={{ fontSize: 12, marginTop: 4 }}>{data.numero}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>Emitido a:</Text>
          <Text style={styles.infoText}>{data.leads?.nombre || 'Cliente'}</Text>
          {data.leads?.razon_social ? <Text style={styles.infoText}>{data.leads.razon_social}</Text> : null}
          {data.leads?.email ? <Text style={styles.infoText}>{data.leads.email}</Text> : null}
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>Detalles:</Text>
          <Text style={styles.infoText}>Fecha: {data.fecha_emision ? format(new Date(data.fecha_emision), 'dd MMM yyyy', { locale: es }) : ''}</Text>
          <Text style={styles.infoText}>Moneda: {data.moneda || 'COP'}</Text>
          <Text style={styles.infoText}>Estado: {data.estado}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colConcepto, styles.textHeader]}>Descripción</Text>
          <Text style={[styles.colQty, styles.textHeader]}>Cant</Text>
          <Text style={[styles.colPrice, styles.textHeader]}>Precio</Text>
          <Text style={[styles.colTotal, styles.textHeader]}>Total</Text>
        </View>
        
        <View style={styles.tableRow}>
          <Text style={[styles.colConcepto, styles.textCell]}>{data.notas || 'Servicios Profesionales de Diseño y Desarrollo'}</Text>
          <Text style={[styles.colQty, styles.textCell]}>1</Text>
          <Text style={[styles.colPrice, styles.textCell]}>{formatCOP(data.subtotal)}</Text>
          <Text style={[styles.colTotal, styles.textCell]}>{formatCOP(data.subtotal)}</Text>
        </View>
      </View>

      <View style={styles.totalsBlock}>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Subtotal</Text>
          <Text style={styles.totalText}>{formatCOP(data.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>IVA (0%)</Text>
          <Text style={styles.totalText}>{formatCOP(data.iva_total || 0)}</Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTop: '1px solid #000' }]}>
          <Text style={styles.totalTextBold}>Total</Text>
          <Text style={styles.totalTextBold}>{formatCOP(data.total)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Cotización generada por el sistema St4keholders. Documento no válido como factura.</Text>
      </View>
    </Page>
  </Document>
)

import { renderToStream } from '@react-pdf/renderer'
export async function getCotizacionStream(data: any) {
  return await renderToStream(<CotizacionDocument data={data} />)
}
