import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingHorizontal: 50,
    paddingVertical: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    letterSpacing: 2,
    color: '#000000',
    textTransform: 'uppercase',
  },
  subTitle: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 12,
    color: '#000000',
    marginTop: 5,
  },
  nitEmisor: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
    marginTop: 2,
  },
  docTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#000000',
    marginTop: 8,
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  detailsBlock: {
    flexDirection: 'column',
  },
  detailsLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#000000',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  detailsValue: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1.5px solid #000000',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  colConcepto: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  textHeader: { 
    fontFamily: 'Helvetica-Bold', 
    fontSize: 9, 
    color: '#ffffff' 
  },
  textCell: { 
    fontFamily: 'Helvetica', 
    fontSize: 9, 
    color: '#000000' 
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pendienteBlock: {
    width: '50%',
  },
  pendienteText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#000000',
  },
  totalsBlock: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalText: { 
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    color: '#000000' 
  },
  totalTextBold: { 
    fontFamily: 'Helvetica-Bold', 
    fontSize: 11, 
    color: '#000000' 
  },
  bankSection: {
    marginTop: 60,
  },
  bankTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#000000',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bankText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#000000',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#000000',
  }
})

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(n || 0)
}

export const CotizacionDocument = ({ data }: { data: any }) => {
  const clienteNombre = data.leads?.razon_social || data.leads?.nombre || 'Cliente'
  const clienteDocumento = data.leads?.numero_documento || '—'
  const fechaEmision = data.fecha_emision ? format(new Date(data.fecha_emision), 'dd/MM/yyyy') : ''
  const pendiente = (data.total || 0) - (data.monto_pagado || 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado centrado */}
        <View style={styles.header}>
          <Text style={styles.logo}>STAKEHOLDERS</Text>
          <Text style={styles.subTitle}>Juan Andres Vasquez Mena</Text>
          <Text style={styles.nitEmisor}>1.004.011.582-8</Text>
          <Text style={styles.docTitle}>Cuenta de cobro: {data.numero}</Text>
        </View>

        {/* Sección de detalles (Comprador, Nit, Fecha) */}
        <View style={styles.detailsSection}>
          <View style={[styles.detailsBlock, { width: '40%' }]}>
            <Text style={styles.detailsLabel}>Comprador</Text>
            <Text style={styles.detailsValue}>{clienteNombre}</Text>
          </View>
          <View style={[styles.detailsBlock, { width: '30%' }]}>
            <Text style={styles.detailsLabel}>Nit</Text>
            <Text style={styles.detailsValue}>{clienteDocumento}</Text>
          </View>
          <View style={[styles.detailsBlock, { width: '30%' }]}>
            <Text style={styles.detailsLabel}>Fecha</Text>
            <Text style={styles.detailsValue}>{fechaEmision}</Text>
          </View>
        </View>

        {/* Tabla */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colConcepto, styles.textHeader]}>Concepto</Text>
            <Text style={[styles.colQty, styles.textHeader]}>Cantidad</Text>
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

        {/* Sección inferior (Pendiente y Totales) */}
        <View style={styles.bottomSection}>
          <View style={styles.pendienteBlock}>
            <Text style={styles.pendienteText}>
              Valor total pendiente: {formatCOP(pendiente)}
            </Text>
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Subtotal</Text>
              <Text style={styles.totalText}>{formatCOP(data.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Retención</Text>
              <Text style={styles.totalText}>0%</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTop: '1.5px solid #000000' }]}>
              <Text style={styles.totalTextBold}>Total</Text>
              <Text style={styles.totalTextBold}>{formatCOP(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* Cuenta Bancaria */}
        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Cuenta Bancaria</Text>
          <Text style={styles.bankText}>Ahorros bancolombia</Text>
          <Text style={styles.bankText}>91212570872</Text>
        </View>

        {/* Pie de Página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Stakeholders | +57 302 521 9775 | stakeholdersadm@gmail.com
          </Text>
        </View>
      </Page>
    </Document>
  )
}

import { renderToStream } from '@react-pdf/renderer'
export async function getCotizacionStream(data: any) {
  return await renderToStream(<CotizacionDocument data={data} />)
}
