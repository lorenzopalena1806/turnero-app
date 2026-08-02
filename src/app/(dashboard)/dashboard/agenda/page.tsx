import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentCard from '@/components/AppointmentCard'
import { format, parseISO, startOfDay, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

import { getTenantContext } from '@/utils/rbac'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const supabase = await createClient()
  
  const { tenant, role, staffProfileId } = await getTenantContext()
  const isStaff = role === 'STAFF'

  // Selected date or today
  const selectedDate = date ? parseISO(date) : new Date()
  
  // Fetch appointments for the next 7 days to show counts or we just fetch for the selected day for simplicity.
  const start = startOfDay(selectedDate).toISOString()
  const end = new Date(startOfDay(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('appointments')
    .select('*, staff(*)')
    .eq('tenant_id', tenant.id)
    .gte('start_time', start)
    .lt('start_time', end)
    .order('start_time', { ascending: true })

  if (isStaff && staffProfileId) {
    query = query.eq('staff_id', staffProfileId)
  }

  const { data: appointments } = await query

  // Generate date tabs: today + 30 days in the future
  const today = new Date()
  const dateTabs = Array.from({ length: 30 }).map((_, i) => addDays(today, i))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h3 className="font-black text-3xl text-indigo-950">Agenda</h3>
        <p className="text-indigo-900/50 font-bold mt-1 text-sm">Administra tus reservas diarias.</p>
      </div>

      {/* Date Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar mb-8 scroll-smooth">
        {dateTabs.map((d, i) => {
          const isSelected = isSameDay(d, selectedDate)
          const isToday = isSameDay(d, today)
          const dateStr = format(d, 'yyyy-MM-dd')
          
          return (
            <a 
              key={i}
              id={isSelected ? 'selected-date' : undefined}
              href={`/dashboard/agenda?date=${dateStr}`}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-500 border-transparent text-white shadow-lg shadow-purple-500/25 -translate-y-1' 
                  : 'bg-white/60 border-white hover:border-purple-300 text-indigo-950 shadow-sm'
              }`}
            >
              <span className={`text-[10px] uppercase font-black tracking-widest ${isSelected ? 'text-white/70' : 'text-indigo-900/40'}`}>
                {isToday ? 'Hoy' : format(d, 'EEE', { locale: es })}
              </span>
              <span className="text-2xl font-black mt-1">{format(d, 'dd')}</span>
            </a>
          )
        })}
      </div>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => document.getElementById('selected-date')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 50);` }} />

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {appointments?.length === 0 ? (
          <div className="col-span-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white shadow-xl shadow-indigo-900/5 text-center">
            <p className="text-indigo-900/50 font-bold text-lg">Hoy no tenemos más turnos, pero fíjate otro día.</p>
          </div>
        ) : (
          appointments?.map(appt => (
            <AppointmentCard key={appt.id} appointment={appt} requirePaymentMethod={tenant.require_payment_method} />
          ))
        )}
      </div>
    </div>
  )
}
