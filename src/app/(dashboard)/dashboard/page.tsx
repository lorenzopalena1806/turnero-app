import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function TenantDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch current user's tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) {
    // If they login but have no tenant, maybe they are not fully provisioned yet
    return (
      <div className="text-center py-20 text-neutral-400">
        <h2 className="text-2xl text-white mb-2">Sin comercio asociado</h2>
        <p>Por favor contacta al administrador para que aprovisione tu cuenta.</p>
      </div>
    )
  }

  // Fetch services for this tenant
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">¡Hola, {tenant.name}!</h1>
          <p className="text-neutral-400 mt-2">Gestiona tu catálogo de servicios y ajustes.</p>
        </div>
        <a 
          href={`/${tenant.slug}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm transition-colors border border-neutral-700 flex items-center gap-2"
        >
          Ver mi Turnero
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Mis Servicios</h2>
            <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Agregar Servicio
            </button>
          </div>

          <div className="space-y-4">
            {services && services.length > 0 ? (
              services.map(service => (
                <div key={service.id} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-xl border border-neutral-800/50">
                  <div>
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <p className="text-sm text-neutral-400">{service.duration_minutes} min</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${service.price}</p>
                    <div className="flex gap-2 mt-1">
                      <button className="text-xs text-blue-400 hover:text-blue-300">Editar</button>
                      <button className="text-xs text-red-400 hover:text-red-300">Borrar</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500 bg-neutral-950/30 rounded-xl border border-neutral-800/50 border-dashed">
                Aún no has agregado servicios.
              </div>
            )}
          </div>
        </div>

        {/* Quick Settings */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-xl font-semibold mb-6">Ajustes Rápidos</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Número de WhatsApp</label>
              <input 
                type="text" 
                disabled 
                value={tenant.whatsapp_number}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 opacity-70 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Slug (URL)</label>
              <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
                <span className="px-3 py-2 bg-neutral-900 text-neutral-500 text-sm border-r border-neutral-800">turnero.com/</span>
                <input 
                  type="text" 
                  disabled 
                  value={tenant.slug}
                  className="w-full bg-transparent px-3 py-2 text-sm text-neutral-300 opacity-70 cursor-not-allowed outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
