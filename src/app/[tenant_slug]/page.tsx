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

  if (tenant.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-white">Local Pausado</h2>
          <p className="text-neutral-400 font-bold">
            Este comercio se encuentra temporalmente suspendido. Por favor intenta de nuevo más tarde o comunícate con el dueño.
          </p>
        </div>
      </div>
    )
  }

  // Fetch their services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  const { data: staff } = await supabase
    .from('staff')
    .select('*, staff_schedules(*)')
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
