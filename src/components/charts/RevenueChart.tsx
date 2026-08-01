'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts'

export default function RevenueChart({ data }: { data: any[] }) {
  // data format: [{ date: '01/08', total: 5000 }, ...]
  
  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-indigo-100 rounded-2xl">
        <p className="text-indigo-900/40 font-bold">No hay datos suficientes para graficar.</p>
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 700, opacity: 0.5 }}
            dy={10}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '4 4' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 backdrop-blur-md border border-white p-3 rounded-xl shadow-xl">
                    <p className="text-indigo-950 font-black text-lg">${payload[0].value?.toLocaleString()}</p>
                    <p className="text-indigo-900/50 font-bold text-xs">{payload[0].payload.date}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
