'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { createClient as createJSClient } from '@supabase/supabase-js'

export async function addStaffAction(tenantId: string, name: string, email?: string, password?: string, imageUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  let authUserId = null;

  // Si se provee email y contraseña, creamos la cuenta usando la Service Role Key (Admin)
  // para crear la cuenta ya verificada y no cerrar la sesión del dueño.
  if (email && password) {
    const adminSupabase = createJSClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authError) return { error: `Error creando cuenta: ${authError.message}` }
    if (!authData.user) return { error: 'No se pudo crear la cuenta del usuario.' }
    
    authUserId = authData.user.id
  }

  const { data: staffData, error } = await supabase.from('staff').insert({
    tenant_id: tenantId,
    name,
    image_url: imageUrl || null,
    is_active: true
  }).select('id').single()

  if (error) return { error: error.message }

  // Si creamos una cuenta, la vinculamos en tenant_users
  if (authUserId && staffData) {
    const { error: rbacError } = await supabase.from('tenant_users').insert({
      user_id: authUserId,
      tenant_id: tenantId,
      role: 'STAFF',
      staff_profile_id: staffData.id
    })
    if (rbacError) return { error: 'Staff creado, pero hubo un error asignando permisos.' }
  }

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

export async function editStaffAction(staffId: string, name: string, imageUrl?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('staff').update({ name, image_url: imageUrl || null }).eq('id', staffId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/staff')
  return { success: true }
}
