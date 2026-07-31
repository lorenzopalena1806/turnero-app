import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Trash2, Plus, Sparkles, TrendingUp, Users } from 'lucide-react'

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
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      
      {/* Header section with Stats */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resumen General</h1>
        <p className="text-slate-400">Administra los servicios de {tenant.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 relative z-10">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-400">Servicios Activos</p>
            <p className="text-2xl font-bold text-white">{services?.length || 0}</p>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 relative z-10">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-400">URL Pública</p>
            <p className="text-sm font-bold text-white truncate max-w-[150px]">/{tenant.slug}</p>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 relative z-10">
            <Users className="w-6 h-6 text-pink-400" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-400">WhatsApp</p>
            <p className="text-sm font-bold text-white truncate max-w-[150px]">{tenant.whatsapp_number}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Service Form */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sticky top-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Nuevo Servicio</h2>
              <p className="text-sm text-slate-400 mt-1">Agrega un servicio al catálogo</p>
            </div>
            
            <form action={addService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre del Servicio</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Ej. Corte de Pelo"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Precio ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input 
                    type="number" 
                    name="price" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar Servicio
              </button>
            </form>
          </div>
        </div>

        {/* Services List */}
        <div className="lg:col-span-2">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-xl font-bold text-white">Catálogo Actual</h2>
            </div>
            
            {services?.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">Aún no hay servicios</p>
                <p className="text-sm text-slate-500 mt-1">Agrega el primero desde el panel izquierdo.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {services?.map(service => (
                  <li key={service.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                      <p className="text-indigo-400 font-bold mt-1">${service.price}</p>
                    </div>
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={service.id} />
                      <button 
                        type="submit"
                        className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
