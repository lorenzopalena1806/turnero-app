import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Trash2, Scissors } from 'lucide-react'
import AddServiceForm from '@/components/AddServiceForm'
import { deleteServiceAction } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login?error=no_role')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
      
      {/* Column 1: Add Service */}
      <div className="xl:col-span-1">
        <AddServiceForm tenantId={tenant.id} />
      </div>

      {/* Column 2 & 3: Services List */}
      <div className="xl:col-span-2">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-3xl text-indigo-950">Catálogo Activo</h3>
            <p className="text-indigo-900/50 font-bold mt-1 text-sm">Tus servicios públicos.</p>
          </div>
          <span className="bg-white/60 backdrop-blur-md border border-white text-indigo-900 font-black px-4 py-2 rounded-xl shadow-sm text-sm">
            {services?.length || 0} items
          </span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {services?.length === 0 ? (
            <div className="col-span-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white shadow-xl shadow-indigo-900/5 text-center">
              <p className="text-indigo-900/50 font-bold">Aún no tienes servicios en tu catálogo. Agrega el primero a la izquierda.</p>
            </div>
          ) : (
            services?.map(service => (
              <div key={service.id} className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-xl shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full gap-6">
                <div>
                  <h4 className="font-black text-indigo-950 text-xl leading-tight">{service.name}</h4>
                  <div className="mt-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-500/70 bg-purple-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Servicio
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-indigo-50 pt-4 mt-auto">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-2xl">${service.price}</span>
                  <form action={async (formData) => {
                    'use server'
                    await deleteServiceAction(formData)
                  }}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="tenant_id" value={tenant.id} />
                    <button 
                      type="submit"
                      className="text-indigo-900/30 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all active:scale-95"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
