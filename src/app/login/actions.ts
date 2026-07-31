'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Ideally we would return the error to the client, but for simplicity here we redirect with error
    return redirect('/login?error=auth_failed')
  }

  // Detect role based on user metadata or a database query
  // For demonstration, let's assume we check if they are a superadmin via metadata
  const isSuperAdmin = data.user.user_metadata?.is_super_admin === true

  if (isSuperAdmin) {
    revalidatePath('/', 'layout')
    return redirect('/admin')
  }

  // If not super admin, check if they own a tenant
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', data.user.id)
    .single()

  if (tenantData) {
    revalidatePath('/', 'layout')
    return redirect('/dashboard')
  }

  // Fallback if they are a user but have no specific role assigned yet
  return redirect('/login?error=no_role')
}
