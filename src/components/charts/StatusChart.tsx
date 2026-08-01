'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function StatusChart({ completed, cancelled }: { completed: number, cancelled: number }) {
  if (completed === 0 && cancelled === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-indigo-100 rounded-2xl">
        <p className="text-indigo-900/40 font-bold">Sin datos para mostrar.</p>
      </div>
    )
  }

  const data = [
    { name: 'Asistencias', value: completed, color: '#10b981' },
    { name: 'Cancelaciones', value: cancelled, color: '#f43f5e' }
  ]

  return (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 backdrop-blur-md border border-white p-3 rounded-xl shadow-xl flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
                    <span className="font-bold text-indigo-950">{payload[0].name}:</span>
                    <span className="font-black text-indigo-950">{payload[0].value}</span>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            content={(props) => {
              const { payload } = props;
              return (
                <ul className="flex justify-center gap-6 mt-4">
                  {payload?.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-sm font-bold text-indigo-950">{entry.value}</span>
                      <span className="text-xs font-bold text-indigo-900/50 uppercase">{entry.value === 'Asistencias' ? 'Asistencias' : 'Cancelaciones'}</span>
                    </li>
                  ))}
                </ul>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
