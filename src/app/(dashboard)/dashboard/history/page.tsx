import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageCircle, Search } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login')

  // Fetch all appointments ordered by start_time descending
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      customer_name,
      customer_phone,
      start_time,
      status,
      services,
      total_price,
      staff ( name )
    `)
    .eq('tenant_id', tenant.id)
    .order('start_time', { ascending: false })

  const safeAppointments = appointments || []

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-indigo-950">Base de Datos de Clientes</h2>
        <p className="text-indigo-900/50 font-bold mt-1">Historial completo de todas las reservas y clientes.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl shadow-indigo-900/5 overflow-hidden">
        
        {/* Top Bar */}
        <div className="p-6 border-b border-indigo-50 flex items-center justify-between">
          <h3 className="font-black text-indigo-950 text-xl">Registro Histórico</h3>
          <div className="bg-indigo-50/50 flex items-center px-4 py-2 rounded-xl border border-indigo-100 w-64">
            <Search className="w-4 h-4 text-indigo-300 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="bg-transparent border-none outline-none text-sm font-bold text-indigo-950 placeholder:text-indigo-900/30 w-full"
              disabled
              title="La búsqueda estará disponible pronto"
            />
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
              {safeAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-indigo-900/40 font-bold">
                    No hay registros en el historial todavía.
                  </td>
                </tr>
              ) : (
                safeAppointments.map((app) => {
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
                        <div className="font-bold text-indigo-950">{(app.staff as any)?.name || 'Sin asignar'}</div>
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
    </div>
  )
}
