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
    
    if (name && !isNaN(price)) {
      const supabase = await createClient()
      await supabase.from('services').insert({
        tenant_id: tenant.id,
        name,
        price,
      })
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Column 1: Add Service */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-28">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900">Agregar Servicio</h3>
          </div>
          
          <form action={addService} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Servicio</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Corte Clásico"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Precio ($)</label>
              <input 
                type="number" 
                name="price" 
                step="0.01" 
                required 
                placeholder="1500.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              Guardar Servicio
            </button>
          </form>
        </div>
      </div>

      {/* Column 2 & 3: Services List */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-xl text-slate-900">Catálogo Activo</h3>
          <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            {services?.length || 0} items
          </span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {services?.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
              <p className="text-slate-500 font-medium">Aún no tienes servicios en tu catálogo. Agrega el primero a la izquierda.</p>
            </div>
          ) : (
            services?.map(service => (
              <div key={service.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between h-full gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{service.name}</h4>
                  <div className="mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Servicio
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <span className="font-black text-emerald-600 text-xl">${service.price}</span>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button 
                      type="submit"
                      className="text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 p-2 rounded-xl transition-all active:scale-95 border border-transparent hover:border-rose-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
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
