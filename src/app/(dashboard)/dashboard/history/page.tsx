import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import HistoryTable from '@/components/HistoryTable'

import { requireAdmin } from '@/utils/rbac'

export default async function HistoryPage() {
  const { tenant } = await requireAdmin()
  const supabase = await createClient()

  // Fetch all staff members for the filter
  const { data: staffList } = await supabase
    .from('staff')
    .select('id, name')
    .eq('tenant_id', tenant.id)
    .order('name')

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
      staff_id,
      staff ( name )
    `)
    .eq('tenant_id', tenant.id)
    .order('start_time', { ascending: false })

  const safeAppointments = appointments || []
  const safeStaffList = staffList || []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-indigo-950">Base de Datos de Clientes</h2>
        <p className="text-indigo-900/50 font-bold mt-1">Historial completo de todas las reservas y clientes.</p>
      </div>

      <HistoryTable appointments={safeAppointments as any} staffList={safeStaffList} />
    </div>
  )
}
