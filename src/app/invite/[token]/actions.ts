'use server'

import { createClient } from '@/utils/supabase/server'

export async function processInviteAction(token: string, email: string, password: string) {
  const supabase = await createClient()

  // Verify invite token
  const { data: invite, error: inviteError } = await supabase
    .from('staff_invites')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError || !invite) {
    return { error: 'Invitación inválida.' }
  }

  if (invite.used) {
    return { error: 'Esta invitación ya fue usada.' }
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { error: 'Esta invitación ha expirado.' }
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'No se pudo crear el usuario.' }
  }

  // Assign user to tenant with STAFF role
  const { error: insertTenantUserError } = await supabase
    .from('tenant_users')
    .insert({
      user_id: authData.user.id,
      tenant_id: invite.tenant_id,
      role: 'STAFF',
      staff_profile_id: invite.staff_id
    })

  if (insertTenantUserError) {
    return { error: 'Error al vincular el usuario al local.' }
  }

  // Mark invite as used
  await supabase
    .from('staff_invites')
    .update({ used: true })
    .eq('id', invite.id)

  return { success: true }
}
