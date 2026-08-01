import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { DollarSign, TrendingUp, Users, Star, PieChart as PieChartIcon } from 'lucide-react'
import RevenueChart from '@/components/charts/RevenueChart'
import StatusChart from '@/components/charts/StatusChart'

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range = 'month' } = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login')

  const now = new Date()
  let startDate: Date
  let endDate: Date
  let rangeLabel = ''

  if (range === 'today') {
    startDate = startOfDay(now)
    endDate = endOfDay(now)
    rangeLabel = 'Hoy'
  } else if (range === 'week') {
    startDate = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    endDate = endOfWeek(now, { weekStartsOn: 1 })
    rangeLabel = 'Esta Semana'
  } else {
    startDate = startOfMonth(now)
    endDate = endOfMonth(now)
    rangeLabel = 'Este Mes'
  }

  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()

  // Fetch appointments (both completed and cancelled to calculate ratio)
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      total_price,
      status,
      start_time,
      staff_id,
      services,
      staff ( name )
    `)
    .eq('tenant_id', tenant.id)
    .in('status', ['completed', 'cancelled'])
    .gte('start_time', startIso)
    .lte('start_time', endIso)
    .order('start_time', { ascending: true })

  const { data: staffList } = await supabase
    .from('staff')
    .select('id, name')
    .eq('tenant_id', tenant.id)

  const safeAppointments = appointments || []
  const safeStaffList = staffList || []

  const completedAppointments = safeAppointments.filter(app => app.status === 'completed')
  const cancelledAppointments = safeAppointments.filter(app => app.status === 'cancelled')

  const totalRevenue = completedAppointments.reduce((acc, curr) => acc + Number(curr.total_price), 0)
  const totalCompleted = completedAppointments.length

  // Calculate revenue per staff
  const staffStats = safeStaffList.map(member => {
    const memberApps = completedAppointments.filter(app => app.staff_id === member.id)
    const revenue = memberApps.reduce((acc, curr) => acc + Number(curr.total_price), 0)
    return {
      name: member.name,
      appointments: memberApps.length,
      revenue
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // Calculate most popular service
  const serviceCounts: Record<string, { count: number, revenue: number }> = {}
  completedAppointments.forEach(app => {
    if (app.services && Array.isArray(app.services)) {
      app.services.forEach(s => {
        if (!serviceCounts[s.name]) serviceCounts[s.name] = { count: 0, revenue: 0 }
        serviceCounts[s.name].count += 1
        serviceCounts[s.name].revenue += Number(s.price)
      })
    }
  })
  
  const popularServices = Object.entries(serviceCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)

  const topService = popularServices[0]

  // Prepare data for Revenue Chart
  // Group by date (MM/dd)
  const chartDataMap: Record<string, number> = {}
  completedAppointments.forEach(app => {
    const d = format(parseISO(app.start_time), 'dd/MM', { locale: es })
    if (!chartDataMap[d]) chartDataMap[d] = 0
    chartDataMap[d] += Number(app.total_price)
  })

  const revenueChartData = Object.entries(chartDataMap).map(([date, total]) => ({ date, total }))

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-950">Analíticas de {tenant.name}</h2>
          <p className="text-indigo-900/50 font-bold mt-1">Métricas clave para hacer crecer tu negocio.</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-sm">
          <a href="/dashboard/stats?range=today" className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${range === 'today' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-900/50 hover:bg-white/50'}`}>Hoy</a>
          <a href="/dashboard/stats?range=week" className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${range === 'week' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-900/50 hover:bg-white/50'}`}>Semana</a>
          <a href="/dashboard/stats?range=month" className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${range === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-900/50 hover:bg-white/50'}`}>Mes</a>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-black text-indigo-950">Ingresos</h3>
          </div>
          <p className="text-4xl font-black text-emerald-500">${totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-black text-indigo-950">Turnos Completados</h3>
          </div>
          <p className="text-4xl font-black text-purple-600">{totalCompleted}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="font-black text-indigo-950">Lo Más Solicitado</h3>
              </div>
              <p className="text-2xl font-black text-indigo-950 leading-none">
                {topService ? topService.name : 'Sin datos'}
              </p>
              {topService && (
                <p className="text-sm font-bold text-indigo-900/40 mt-2">Reservado {topService.count} veces (${topService.revenue.toLocaleString()})</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5 lg:col-span-2">
          <h3 className="font-black text-indigo-950 text-xl mb-6">Evolución de Ingresos</h3>
          <RevenueChart data={revenueChartData} />
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5">
          <h3 className="font-black text-indigo-950 text-xl mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-500" /> Asistencia
          </h3>
          <StatusChart completed={completedAppointments.length} cancelled={cancelledAppointments.length} />
        </div>

      </div>

      {/* Staff Ranking */}
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5">
        <h3 className="font-black text-indigo-950 text-xl mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Podio del Personal ({tenant.staff_label || 'Staff'})
        </h3>
        
        {staffStats.length === 0 ? (
          <p className="text-center py-10 font-bold text-indigo-900/40 border-2 border-dashed border-indigo-50 rounded-2xl">
            Aún no hay turnos completados para generar estadísticas.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffStats.map((stat, i) => (
              <div key={i} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all hover:-translate-y-1 ${i === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white shadow-lg shadow-indigo-500/25' : 'bg-white/60 border-white hover:border-indigo-100 shadow-sm'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl ${i === 0 ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-400'}`}>
                    #{i + 1}
                  </div>
                  <div>
                    <h4 className={`font-black text-lg ${i === 0 ? 'text-white' : 'text-indigo-950'}`}>{stat.name}</h4>
                    <p className={`text-xs font-bold ${i === 0 ? 'text-white/70' : 'text-indigo-900/50'}`}>{stat.appointments} turnos</p>
                  </div>
                </div>
                <p className={`text-2xl font-black ${i === 0 ? 'text-white' : 'text-indigo-600'}`}>
                  ${stat.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
