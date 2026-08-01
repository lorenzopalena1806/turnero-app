import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DollarSign, TrendingUp, Users } from 'lucide-react'

export default async function StatsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login')

  // Get all completed appointments for the current month
  const start = startOfMonth(new Date()).toISOString()
  const end = endOfMonth(new Date()).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      total_price,
      staff_id,
      staff ( name )
    `)
    .eq('tenant_id', tenant.id)
    .eq('status', 'completed')
    .gte('start_time', start)
    .lte('start_time', end)

  const { data: staffList } = await supabase
    .from('staff')
    .select('id, name')
    .eq('tenant_id', tenant.id)

  const safeAppointments = appointments || []
  const safeStaffList = staffList || []

  const totalRevenue = safeAppointments.reduce((acc, curr) => acc + Number(curr.total_price), 0)
  const totalAppointments = safeAppointments.length

  // Calculate revenue per staff
  const staffStats = safeStaffList.map(member => {
    const memberApps = safeAppointments.filter(app => app.staff_id === member.id)
    const revenue = memberApps.reduce((acc, curr) => acc + Number(curr.total_price), 0)
    return {
      name: member.name,
      appointments: memberApps.length,
      revenue
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const currentMonthName = format(new Date(), 'MMMM', { locale: es })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-indigo-950">Estadísticas</h2>
        <p className="text-indigo-900/50 font-bold mt-1 capitalize">Resultados de {currentMonthName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-black text-indigo-950 text-xl">Ingresos del Mes</h3>
          </div>
          <p className="text-5xl font-black text-emerald-500">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm font-bold text-indigo-900/40 mt-2">Solo turnos marcados como completados</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-black text-indigo-950 text-xl">Total de Turnos</h3>
          </div>
          <p className="text-5xl font-black text-purple-600">{totalAppointments}</p>
          <p className="text-sm font-bold text-indigo-900/40 mt-2">Turnos concretados exitosamente</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5">
        <h3 className="font-black text-indigo-950 text-xl mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Rendimiento por Profesional
        </h3>
        
        {staffStats.length === 0 ? (
          <p className="text-center py-10 font-bold text-indigo-900/40 border-2 border-dashed border-indigo-50 rounded-2xl">
            Aún no hay turnos completados este mes para generar estadísticas.
          </p>
        ) : (
          <div className="space-y-4">
            {staffStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div>
                  <h4 className="font-black text-indigo-950 text-lg">{stat.name}</h4>
                  <p className="text-xs font-bold text-indigo-900/50">{stat.appointments} turnos completados</p>
                </div>
                <p className="text-2xl font-black text-indigo-600">${stat.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
