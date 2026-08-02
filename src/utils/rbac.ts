import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export type TenantContext = {
  tenant: any
  role: 'ADMIN' | 'STAFF'
  staffProfileId: string | null
}

export async function getTenantContext(): Promise<TenantContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, staff_profile_id, tenant_id, tenants(*)')
    .eq('user_id', user.id)
    .single()

  if (!tenantUser) redirect('/login?error=no_role')

  return {
    tenant: tenantUser.tenants,
    role: tenantUser.role as 'ADMIN' | 'STAFF',
    staffProfileId: tenantUser.staff_profile_id
  }
}

export async function requireAdmin() {
  const context = await getTenantContext()
  if (context.role !== 'ADMIN') {
    redirect('/dashboard/agenda') // Or a generic unauthorized page
  }
  return context
}
