'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(appointmentId: string, status: string, paymentMethod?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Verify ownership or staff assignment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('tenant_id, staff_id, tenants(owner_id)')
    .eq('id', appointmentId)
    .single()

  if (!appointment) return { error: 'No autorizado.' }

  const isOwner = (appointment.tenants as any).owner_id === user.id
  
  let isAssignedStaff = false
  if (!isOwner && appointment.staff_id) {
    const { data: tenantUser } = await supabase
      .from('tenant_users')
      .select('user_id')
      .eq('staff_profile_id', appointment.staff_id)
      .single()
    
    if (tenantUser && tenantUser.user_id === user.id) {
      isAssignedStaff = true
    }
  }

  if (!isOwner && !isAssignedStaff) {
    return { error: 'No autorizado.' }
  }

  const updateData: any = { status }
  if (paymentMethod) {
    updateData.payment_method = paymentMethod
  }

  const { error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/agenda')
  return { success: true }
}
