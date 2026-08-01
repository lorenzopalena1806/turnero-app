import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import TenantStore from '@/components/TenantStore'

export default async function TenantPage({ params }: { params: Promise<{ tenant_slug: string }> }) {
  const supabase = await createClient()
  
  const { tenant_slug } = await params

  // Fetch the tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', tenant_slug)
    .single()

  if (!tenant) {
    notFound()
  }

  // Fetch their services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <TenantStore 
      tenant={tenant} 
      services={services || []} 
      staff={staff || []}
    />
  )
}
