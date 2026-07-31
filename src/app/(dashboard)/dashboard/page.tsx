import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Trash2 } from 'lucide-react'

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
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Catálogo de Servicios</h2>
          <p className="text-gray-500 text-sm mt-1">Administra los servicios de tu comercio.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Formulario */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)] p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Nuevo Servicio</h3>
            <form action={addService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Ej. Corte de Cabello"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input 
                  type="number" 
                  name="price" 
                  step="0.01" 
                  required 
                  placeholder="1500.00"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb]"
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-2 bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-300"
              >
                Guardar Servicio
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Grid de Servicios */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {services?.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                <p className="text-gray-500">Aún no hay servicios en tu catálogo.</p>
              </div>
            ) : (
              services?.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)] p-5 transition-transform duration-200 ease-in-out hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">{service.name}</h4>
                    <p className="text-[#2563eb] font-bold text-xl">${service.price}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={service.id} />
                      <button 
                        type="submit"
                        className="text-gray-400 hover:text-red-600 transition-colors"
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
    </div>
  )
}
