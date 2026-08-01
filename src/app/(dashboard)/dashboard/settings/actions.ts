'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type BusinessHourInput = {
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

export async function saveBusinessHours(tenantId: string, hours: BusinessHourInput[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Verify ownership
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .eq('owner_id', user.id)
    .single()

  if (!tenant) return { error: 'No autorizado para modificar este comercio.' }

  // Upsert each day
  // Because we have a UNIQUE(tenant_id, day_of_week) constraint, we can use an upsert safely.
  const payload = hours.map(h => ({
    tenant_id: tenantId,
    day_of_week: h.day_of_week,
    open_time: h.open_time,
    close_time: h.close_time,
    is_closed: h.is_closed
  }))

  const { error } = await supabase
    .from('business_hours')
    .upsert(payload, { onConflict: 'tenant_id, day_of_week' })

  if (error) {
    console.error('Error guardando horarios:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updateTenantSettingsAction(tenantId: string, data: any) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .eq('owner_id', user.id)
    .single()

  if (!tenant) throw new Error('Not authorized')

  const { error } = await supabase
    .from('tenants')
    .update(data)
    .eq('id', tenantId)

  if (error) throw error

  revalidatePath('/dashboard/settings')
  revalidatePath('/[tenant_slug]', 'page')
}
