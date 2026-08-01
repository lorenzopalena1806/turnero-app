'use client'

import { useState, useMemo } from 'react'
import { format, parseISO, isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageCircle, Search, Filter } from 'lucide-react'

type Appointment = {
  id: string
  customer_name: string
  customer_phone: string
  start_time: string
  status: string
  services: any
  total_price: number
  staff: { name: string } | null
  staff_id: string | null
}

type Staff = {
  id: string
  name: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700'
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado'
}

export default function HistoryTable({ 
  appointments,
  staffList
}: { 
  appointments: Appointment[],
  staffList: Staff[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // all, today, week, month
  const [staffFilter, setStaffFilter] = useState('all') // all, or staff_id

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // 1. Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        app.customer_name.toLowerCase().includes(searchLower) || 
        app.customer_phone.includes(searchLower)
      
      if (!matchesSearch) return false

      // 2. Staff filter
      if (staffFilter !== 'all' && app.staff_id !== staffFilter) return false

      // 3. Time filter
      if (timeFilter !== 'all') {
        const appDate = parseISO(app.start_time)
        const today = new Date()
        
        if (timeFilter === 'today' && !isSameDay(appDate, today)) return false
        if (timeFilter === 'week' && !isSameWeek(appDate, today, { weekStartsOn: 1 })) return false
        if (timeFilter === 'month' && !isSameMonth(appDate, today)) return false
      }

      return true
    })
  }, [appointments, searchTerm, timeFilter, staffFilter])

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl shadow-indigo-900/5 overflow-hidden">
      
      {/* Top Bar with Filters */}
      <div className="p-6 border-b border-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-black text-indigo-950 text-xl whitespace-nowrap">Registro Histórico</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Staff Filter */}
          <select 
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold text-indigo-950 outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
          >
            <option value="all">Todo el personal</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Time Filter */}
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold text-indigo-950 outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>

          {/* Search Bar */}
          <div className="bg-indigo-50/50 flex items-center px-4 py-2 rounded-xl border border-indigo-100 w-full sm:w-64 focus-within:ring-2 focus-within:ring-purple-500">
            <Search className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-indigo-950 placeholder:text-indigo-900/30 w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50/30">
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-indigo-900/50">Cliente</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-indigo-900/50">Fecha y Hora</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-indigo-900/50">Personal</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-indigo-900/50">Servicio / Total</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-indigo-900/50">Estado</th>
              <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-indigo-900/50 text-right">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50/50">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-indigo-900/40 font-bold">
                  {appointments.length === 0 
                    ? 'No hay registros en el historial todavía.' 
                    : 'No hay coincidencias para tu búsqueda.'}
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => {
                const dateObj = parseISO(app.start_time)
                const dateStr = format(dateObj, 'dd MMM, yyyy', { locale: es })
                const timeStr = format(dateObj, 'HH:mm')
                
                // Extract first service name if available
                let serviceName = 'Varios servicios'
                if (Array.isArray(app.services) && app.services.length > 0) {
                  serviceName = app.services.length === 1 ? app.services[0].name : `${app.services[0].name} +${app.services.length - 1}`
                }

                return (
                  <tr key={app.id} className="hover:bg-white/60 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-black text-indigo-950">{app.customer_name}</div>
                      <div className="text-xs font-bold text-indigo-900/50">{app.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-indigo-950 capitalize">{dateStr}</div>
                      <div className="text-xs font-black text-indigo-900/50">{timeStr} hs</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-indigo-950">{app.staff?.name || 'Sin asignar'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-indigo-950">{serviceName}</div>
                      <div className="text-xs font-black text-emerald-500">${app.total_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg ${statusColors[app.status]}`}>
                        {statusLabels[app.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {app.customer_phone ? (
                        <a 
                          href={`https://wa.me/${app.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${app.customer_name}, te escribimos de la peluquería.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-indigo-900/30">-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  )
}
