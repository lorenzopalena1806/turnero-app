import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BusinessHoursForm from '@/components/BusinessHoursForm'
import TenantSettingsForm from '@/components/TenantSettingsForm'

import { requireAdmin } from '@/utils/rbac'

export default async function SettingsPage() {
  const { tenant } = await requireAdmin()
  const supabase = await createClient()

  // Fetch existing business hours
  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('day_of_week', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <TenantSettingsForm tenant={tenant} />
      <BusinessHoursForm tenantId={tenant.id} initialHours={hours || []} />
    </div>
  )
}
