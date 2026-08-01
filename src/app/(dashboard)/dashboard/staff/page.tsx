import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StaffManager from '@/components/StaffManager'

export default async function StaffPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login?error=no_role')

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  const { data: schedules } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('tenant_id', tenant.id)

  const staffLabelPlural = tenant.staff_label ? tenant.staff_label + 's' : 'Profesionales'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-indigo-950">Equipo de Trabajo</h2>
        <p className="text-indigo-900/50 font-bold mt-1">Administra tus {staffLabelPlural.toLowerCase()} y sus horarios individuales.</p>
      </div>

      <StaffManager 
        tenantId={tenant.id} 
        staff={staff || []} 
        schedules={schedules || []} 
        staffLabel={tenant.staff_label || 'Profesional'}
      />
    </div>
  )
}
