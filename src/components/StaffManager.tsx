'use client'

import { useState, useTransition } from 'react'
import { addStaffAction, deleteStaffAction, saveStaffScheduleAction, StaffScheduleInput } from '@/app/(dashboard)/dashboard/staff/actions'
import { Plus, Trash2, Clock, Save, ChevronDown, ChevronUp } from 'lucide-react'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function StaffManager({ tenantId, staff, schedules, staffLabel }: { tenantId: string, staff: any[], schedules: any[], staffLabel: string }) {
  const [isPending, startTransition] = useTransition()
  const [newStaffName, setNewStaffName] = useState('')
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)

  // Form state for the currently expanded staff's schedule
  const [formSchedules, setFormSchedules] = useState<StaffScheduleInput[]>([])

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName) return
    startTransition(async () => {
      await addStaffAction(tenantId, newStaffName)
      setNewStaffName('')
    })
  }

  const handleDeleteStaff = (id: string) => {
    if (!confirm(`¿Seguro que deseas eliminar este ${staffLabel.toLowerCase()}?`)) return
    startTransition(async () => {
      await deleteStaffAction(id)
    })
  }

  const handleExpand = (staffId: string) => {
    if (expandedStaff === staffId) {
      setExpandedStaff(null)
      return
    }
    
    // Load existing schedules for this staff
    const staffSchedules = schedules.filter(s => s.staff_id === staffId)
    
    const days: StaffScheduleInput[] = []
    for (let i = 0; i < 7; i++) {
      const existing = staffSchedules.find(s => s.day_of_week === i)
      if (existing) {
        days.push({
          day_of_week: i,
          is_working: existing.is_working,
          open_time: existing.open_time,
          close_time: existing.close_time,
          open_time_2: existing.open_time_2,
          close_time_2: existing.close_time_2,
        })
      } else {
        days.push({
          day_of_week: i,
          is_working: i !== 0,
          open_time: '09:00:00',
          close_time: '13:00:00',
          open_time_2: null,
          close_time_2: null
        })
      }
    }
    setFormSchedules(days)
    setExpandedStaff(staffId)
  }

  const updateDay = (dayIndex: number, updates: Partial<StaffScheduleInput>) => {
    setFormSchedules(prev => {
      const next = [...prev]
      next[dayIndex] = { ...next[dayIndex], ...updates }
      return next
    })
  }

  const handleSaveSchedule = () => {
    if (!expandedStaff) return
    startTransition(async () => {
      await saveStaffScheduleAction(tenantId, expandedStaff, formSchedules)
      alert('Horarios guardados correctamente')
    })
  }

  return (
    <div className="space-y-8">
      {/* Agregar Staff */}
      <form onSubmit={handleAddStaff} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Nuevo {staffLabel}</label>
          <input 
            type="text" 
            placeholder="Ej: Marcos"
            value={newStaffName}
            onChange={e => setNewStaffName(e.target.value)}
            className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>
        <button 
          type="submit"
          disabled={isPending || !newStaffName}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Lista de Staff */}
      <div className="space-y-4">
        {staff.map(member => (
          <div key={member.id} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => handleExpand(member.id)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-xl">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-black text-indigo-950 text-xl">{member.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteStaff(member.id) }}
                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="p-3 text-indigo-900/40">
                  {expandedStaff === member.id ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
            </div>

            {/* Schedule Editor (Expanded) */}
            {expandedStaff === member.id && (
              <div className="mt-8 border-t border-indigo-50 pt-8 animate-in slide-in-from-top-4 duration-300">
                <h4 className="font-black text-indigo-950 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Horarios de {member.name}
                </h4>
                
                <div className="space-y-4">
                  {formSchedules.map((day, idx) => (
                    <div key={day.day_of_week} className={`p-4 rounded-2xl border ${day.is_working ? 'bg-white border-indigo-100' : 'bg-indigo-50/50 border-transparent opacity-50'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-32 flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={day.is_working}
                            onChange={(e) => updateDay(idx, { is_working: e.target.checked })}
                            className="w-5 h-5 rounded-md text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <span className="font-bold text-indigo-950 text-sm">{DAYS[day.day_of_week]}</span>
                        </div>
                        
                        {day.is_working && (
                          <div className="flex-1 flex flex-col gap-2">
                            {/* Turno 1 */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-900/40 w-16 uppercase">Turno 1</span>
                              <input 
                                type="time" 
                                value={day.open_time?.slice(0, 5) || ''}
                                onChange={(e) => updateDay(idx, { open_time: e.target.value + ':00' })}
                                className="bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-950"
                              />
                              <span className="text-indigo-900/40 font-bold">a</span>
                              <input 
                                type="time" 
                                value={day.close_time?.slice(0, 5) || ''}
                                onChange={(e) => updateDay(idx, { close_time: e.target.value + ':00' })}
                                className="bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-950"
                              />
                            </div>
                            
                            {/* Turno 2 (Siesta/Tarde) */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-900/40 w-16 uppercase">Turno 2</span>
                              <input 
                                type="time" 
                                value={day.open_time_2?.slice(0, 5) || ''}
                                onChange={(e) => updateDay(idx, { open_time_2: e.target.value ? e.target.value + ':00' : null })}
                                className="bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-950"
                              />
                              <span className="text-indigo-900/40 font-bold">a</span>
                              <input 
                                type="time" 
                                value={day.close_time_2?.slice(0, 5) || ''}
                                onChange={(e) => updateDay(idx, { close_time_2: e.target.value ? e.target.value + ':00' : null })}
                                className="bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-950"
                              />
                              <button 
                                onClick={() => updateDay(idx, { open_time_2: null, close_time_2: null })}
                                className="text-xs text-rose-500 font-bold ml-2 hover:underline"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSaveSchedule}
                    disabled={isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" /> Guardar Horarios
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
