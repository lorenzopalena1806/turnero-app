'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStaffAction(tenantId: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabase.from('staff').insert({
    tenant_id: tenantId,
    name,
    is_active: true
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function deleteStaffAction(staffId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('staff').delete().eq('id', staffId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/staff')
  return { success: true }
}

export type StaffScheduleInput = {
  day_of_week: number
  is_working: boolean
  open_time: string | null
  close_time: string | null
  open_time_2: string | null
  close_time_2: string | null
}

export async function saveStaffScheduleAction(tenantId: string, staffId: string, schedules: StaffScheduleInput[]) {
  const supabase = await createClient()

  const payload = schedules.map(s => ({
    tenant_id: tenantId,
    staff_id: staffId,
    day_of_week: s.day_of_week,
    is_working: s.is_working,
    open_time: s.open_time || '09:00:00',
    close_time: s.close_time || '13:00:00',
    open_time_2: s.open_time_2,
    close_time_2: s.close_time_2,
  }))

  const { error } = await supabase
    .from('staff_schedules')
    .upsert(payload, { onConflict: 'staff_id, day_of_week' })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function generateInviteLinkAction(tenantId: string, staffId: string) {
  const supabase = await createClient()
  
  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user.id).eq('id', tenantId).single()
  if (!tenant) return { error: 'No autorizado' }

  // Generate a random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const { data, error } = await supabase.from('staff_invites').insert({
    tenant_id: tenantId,
    staff_id: staffId,
    token
  }).select('token').single()

  if (error) return { error: error.message }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return { success: true, link: `${baseUrl}/invite/${data.token}` }
}
