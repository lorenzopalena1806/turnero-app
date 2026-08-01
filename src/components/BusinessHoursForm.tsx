'use client'

import { useState, useTransition } from 'react'
import { saveBusinessHours, BusinessHourInput } from '@/app/(dashboard)/dashboard/settings/actions'
import { Clock, Save } from 'lucide-react'

const DAYS_OF_WEEK = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
]

type Props = {
  tenantId: string
  initialHours: BusinessHourInput[]
}

export default function BusinessHoursForm({ tenantId, initialHours }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Initialize state with all 7 days
  const [hours, setHours] = useState<BusinessHourInput[]>(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const existing = initialHours.find(h => h.day_of_week === i)
      if (existing) {
        days.push({ ...existing })
      } else {
        days.push({
          day_of_week: i,
          open_time: '09:00:00',
          close_time: '18:00:00',
          is_closed: i === 0 // Sunday closed by default
        })
      }
    }
    return days
  })

  const updateDay = (index: number, updates: Partial<BusinessHourInput>) => {
    setHours(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const handleSave = () => {
    setError(null)
    setSuccessMsg(null)
    startTransition(async () => {
      const result = await saveBusinessHours(tenantId, hours)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMsg('Horarios guardados correctamente.')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    })
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-900/5">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-black text-indigo-950 text-2xl leading-none">Horarios de Atención</h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/50 mt-1">Configura tu disponibilidad</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-100/80 text-rose-700 rounded-2xl text-sm font-bold border border-rose-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-100/80 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-200">
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        {hours.map((day, idx) => (
          <div key={day.day_of_week} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 hover:bg-white transition-colors">
            <div className="w-32 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={!day.is_closed}
                  onChange={(e) => updateDay(idx, { is_closed: !e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
              <span className={`font-bold text-sm ${day.is_closed ? 'text-indigo-900/40 line-through' : 'text-indigo-950'}`}>
                {DAYS_OF_WEEK[day.day_of_week]}
              </span>
            </div>

            <div className={`flex items-center gap-2 flex-1 transition-opacity ${day.is_closed ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex-1">
                <input 
                  type="time" 
                  value={day.open_time.slice(0, 5)}
                  onChange={(e) => updateDay(idx, { open_time: e.target.value + ':00' })}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-indigo-950 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 font-bold text-sm"
                />
              </div>
              <span className="text-indigo-900/40 font-bold text-sm px-2">a</span>
              <div className="flex-1">
                <input 
                  type="time" 
                  value={day.close_time.slice(0, 5)}
                  onChange={(e) => updateDay(idx, { close_time: e.target.value + ':00' })}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-indigo-950 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 font-bold text-sm"
                />
              </div>
            </div>
            
            {day.is_closed && (
              <div className="hidden sm:block flex-1 text-center">
                <span className="text-xs uppercase font-bold tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-md">Cerrado</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-purple-500/25 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isPending ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>
    </div>
  )
}
