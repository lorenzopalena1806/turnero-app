import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Plus, Trash2, Scissors } from 'lucide-react'

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

  async function addService(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const formTenantId = formData.get('tenant_id') as string
    
    if (name && !isNaN(price) && formTenantId) {
      const supabase = await createClient()
      const { error } = await supabase.from('services').insert({
        tenant_id: formTenantId,
        name,
        price,
      })
      if (error) console.error('Error inserting service:', error)
      revalidatePath('/dashboard')
    }
  }

  async function deleteService(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    if (id) {
      const supabase = await createClient()
      await supabase.from('services').delete().eq('id', id).eq('tenant_id', tenant.id)
      revalidatePath('/dashboard')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
      
      {/* Column 1: Add Service */}
      <div className="xl:col-span-1">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5 sticky top-32">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 flex items-center justify-center shadow-inner">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-indigo-950 text-lg leading-none">Agregar Servicio</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/40 mt-1">Nuevo ítem</p>
            </div>
          </div>
          
          <form action={addService} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Nombre del Servicio</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Corte Clásico"
                className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
              />
              <input type="hidden" name="tenant_id" value={tenant.id} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Precio ($)</label>
              <input 
                type="number" 
                name="price" 
                step="0.01" 
                required 
                placeholder="1500.00"
                className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/25 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 text-sm"
            >
              Guardar Servicio
            </button>
          </form>
        </div>
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
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
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
