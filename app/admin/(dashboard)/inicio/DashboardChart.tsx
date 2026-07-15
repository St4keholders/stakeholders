'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

type FlujoData = {
  dia: string
  ingresos: number
  costos: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--line-soft)] p-3 rounded-lg shadow-xl">
        <p className="text-[var(--fg-dim)] text-xs mb-2 font-mono uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-medium">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--fg)]">
              {entry.name}: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardChart({ data }: { data: FlujoData[] }) {
  const formattedData = data.map(item => {
    const d = new Date(item.dia + 'T00:00:00') // to avoid timezone shifts
    return {
      ...item,
      diaFormato: d.getDate().toString() // simple day number for X axis
    }
  })

  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
          <XAxis 
            dataKey="diaFormato" 
            stroke="#6b6b66" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10} 
            minTickGap={20}
          />
          <YAxis
            stroke="#6b6b66"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#6b6b66', paddingTop: '10px' }}
          />
          <Line
            name="Ingresos"
            type="monotone"
            dataKey="ingresos"
            stroke="#4ade80"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#4ade80' }}
          />
          <Line
            name="Costos"
            type="monotone"
            dataKey="costos"
            stroke="#f87171"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#f87171' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
