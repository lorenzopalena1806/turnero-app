import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentCard from '@/components/AppointmentCard'
import { format, parseISO, startOfDay, addDays, isSameDay } from 'date-fns'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login?error=no_role')

  // Selected date or today
  const selectedDate = date ? parseISO(date) : new Date()
  
  // Fetch appointments for the next 7 days to show counts or we just fetch for the selected day for simplicity.
  const start = startOfDay(selectedDate).toISOString()
  const end = new Date(startOfDay(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, staff(*)')
    .eq('tenant_id', tenant.id)
    .gte('start_time', start)
    .lt('start_time', end)
    .order('start_time', { ascending: true })

  // Generate date tabs: 7 days in the past + 30 days in the future
  const today = new Date()
  const dateTabs = Array.from({ length: 38 }).map((_, i) => addDays(today, i - 7))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h3 className="font-black text-3xl text-indigo-950">Agenda</h3>
        <p className="text-indigo-900/50 font-bold mt-1 text-sm">Administra tus reservas diarias.</p>
      </div>

      {/* Date Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar mb-8">
        {dateTabs.map((d, i) => {
          const isSelected = isSameDay(d, selectedDate)
          const isToday = isSameDay(d, today)
          const dateStr = format(d, 'yyyy-MM-dd')
          
          return (
            <a 
              key={i}
              href={`/dashboard/agenda?date=${dateStr}`}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-500 border-transparent text-white shadow-lg shadow-purple-500/25 -translate-y-1' 
                  : 'bg-white/60 border-white hover:border-purple-300 text-indigo-950 shadow-sm'
              }`}
            >
              <span className={`text-[10px] uppercase font-black tracking-widest ${isSelected ? 'text-white/70' : 'text-indigo-900/40'}`}>
                {isToday ? 'Hoy' : format(d, 'EEE')}
              </span>
              <span className="text-2xl font-black mt-1">{format(d, 'dd')}</span>
            </a>
          )
        })}
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments?.length === 0 ? (
          <div className="col-span-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white shadow-xl shadow-indigo-900/5 text-center">
            <p className="text-indigo-900/50 font-bold">No tienes turnos programados para este día.</p>
          </div>
        ) : (
          appointments?.map(appt => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))
        )}
      </div>
    </div>
  )
}
