import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BusinessHoursForm from '@/components/BusinessHoursForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login?error=no_role')

  // Fetch existing business hours
  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('day_of_week', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <BusinessHoursForm tenantId={tenant.id} initialHours={hours || []} />
    </div>
  )
}
