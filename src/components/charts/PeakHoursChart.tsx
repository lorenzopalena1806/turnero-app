'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PeakHoursChart({ data }: { data: { hour: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-indigo-50 rounded-2xl">
        <p className="font-bold text-indigo-900/40">No hay datos suficientes</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
          <XAxis 
            dataKey="hour" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a5b4fc', fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip 
            cursor={{ fill: '#eef2ff' }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.1)',
              fontWeight: 900,
              color: '#312e81'
            }}
            formatter={(value: any) => [`${value} turnos`, 'Volumen']}
          />
          <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
