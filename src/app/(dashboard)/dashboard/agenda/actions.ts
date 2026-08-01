'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Verify ownership
  const { data: appointment } = await supabase
    .from('appointments')
    .select('tenant_id, tenants(owner_id)')
    .eq('id', appointmentId)
    .single()

  if (!appointment || (appointment.tenants as any).owner_id !== user.id) {
    return { error: 'No autorizado.' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/agenda')
  return { success: true }
}
