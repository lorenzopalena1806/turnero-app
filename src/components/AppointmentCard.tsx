'use client'

import { updateAppointmentStatus } from '@/app/(dashboard)/dashboard/agenda/actions'
import { useState, useTransition } from 'react'
import { Check, X, Clock, MessageCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { User } from 'lucide-react'

export default function AppointmentCard({ appointment }: { appointment: any }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(appointment.status)

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointment.id, newStatus)
      if (res.success) {
        setStatus(newStatus)
      }
    })
  }

  // El servidor guarda la hora local como si fuera UTC.
  // Para evitar que el navegador del cliente lo convierta a su zona horaria (restándole 3 horas),
  // extraemos directamente la porción de la hora del string ISO (ej: "2026-08-01T09:30:00Z" -> "09:30")
  const formatTimeStr = (isoString: string) => {
    if (!isoString) return ''
    const timePart = isoString.split('T')[1]
    return timePart ? timePart.substring(0, 5) : ''
  }

  const startTimeStr = formatTimeStr(appointment.start_time)
  const endTimeStr = formatTimeStr(appointment.end_time)

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }

  return (
    <div className={`bg-white/90 backdrop-blur-xl border-2 rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 transition-all ${status === 'cancelled' ? 'opacity-50 border-white' : 'border-indigo-50 hover:-translate-y-1'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-indigo-950 text-xl">{appointment.customer_name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-indigo-900/50 font-bold text-sm">{appointment.customer_phone}</p>
            {appointment.customer_phone && (
              <a 
                href={`https://wa.me/${appointment.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${appointment.customer_name}, te escribimos para confirmar tu turno hoy a las ${startTimeStr}. ¿Nos confirmas tu asistencia?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors"
                title="Confirmar asistencia por WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <span className={`text-xs uppercase font-black tracking-widest px-3 py-1 rounded-lg border ${statusColors[status] || statusColors.pending}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 text-indigo-900/70 font-bold bg-indigo-50/50 w-fit px-3 py-1.5 rounded-xl border border-indigo-100">
          <Clock className="w-4 h-4 text-purple-500" />
          {startTimeStr} - {endTimeStr}
        </div>
        {appointment.staff && (
          <div className="flex items-center gap-2 text-indigo-900/70 font-bold bg-indigo-50/50 w-fit px-3 py-1.5 rounded-xl border border-indigo-100">
            <User className="w-4 h-4 text-purple-500" />
            {appointment.staff.name}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {appointment.services.map((s: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-indigo-950 font-bold">{s.name}</span>
            <span className="text-purple-600 font-black">${s.price}</span>
          </div>
        ))}
        <div className="border-t border-indigo-50 pt-2 flex justify-between mt-2">
          <span className="text-indigo-900/50 font-black text-xs uppercase tracking-widest">Total</span>
          <span className="text-indigo-950 font-black">${appointment.total_price}</span>
        </div>
      </div>

      {status === 'pending' && (
        <div className="flex gap-2">
          <button 
            disabled={isPending}
            onClick={() => handleStatusChange('completed')}
            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Completar
          </button>
          <button 
            disabled={isPending}
            onClick={() => handleStatusChange('cancelled')}
            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
