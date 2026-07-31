import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Search, Plus, Trash2, Scissors } from 'lucide-react'

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
    <div className="space-y-6">
      
      {/* Search Bar matching screenshot */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex items-center shadow-sm">
        <div className="px-4 text-slate-400">
          <Search className="w-5 h-5 text-blue-500" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar servicio por nombre..." 
          className="flex-1 border-none focus:outline-none focus:ring-0 text-slate-700 py-2 placeholder-slate-400"
        />
        <div className="px-2">
          <button className="bg-[#1C2C40] hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
            Actualizar Tablero
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Add Service */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              <h3 className="font-bold text-slate-800">Nuevo Servicio</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1">
            <form action={addService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nombre del Servicio</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Ej. Corte Clásico"
                  className="w-full bg-[#E8F0FE]/60 border-none rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Precio ($)</label>
                <input 
                  type="number" 
                  name="price" 
                  step="0.01" 
                  required 
                  placeholder="1500.00"
                  className="w-full bg-[#E8F0FE]/60 border-none rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all text-sm font-medium"
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-2 bg-[#0F9D58] hover:bg-[#0d8a4d] text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Guardar Servicio
              </button>
            </form>
          </div>
        </div>

        {/* Column 2 & 3: Services List */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 className="font-bold text-slate-800">Catálogo Activo</h3>
            </div>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {services?.length || 0}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {services?.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 font-medium">Aún no tienes servicios en tu catálogo.</p>
              </div>
            ) : (
              services?.map(service => (
                <div key={service.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{service.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Scissors className="w-3 h-3" />
                        Servicio
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <span className="font-bold text-emerald-600 text-xl">${service.price}</span>
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={service.id} />
                      <button 
                        type="submit"
                        className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
    </div>
  )
}
