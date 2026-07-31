import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateTenantForm from '@/components/CreateTenantForm'
import { LogOut } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_super_admin !== true) {
    redirect('/login')
  }

  // Fetch tenants
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header Fijo */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-[#2563eb] text-white shadow-md">
        <div>
          <h1 className="text-xl font-bold m-0">Turnero Central</h1>
          <p className="text-sm opacity-80 m-0">SuperAdmin</p>
        </div>
        <div className="flex items-center gap-4">
          <CreateTenantForm />
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 hover:bg-[#1e40af] transition-colors p-2 rounded">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto p-8">
        
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#333]">Comercios Registrados</h2>
            <p className="text-gray-500 text-sm mt-1">Directorio de inquilinos en la plataforma.</p>
          </div>
          <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-200">
            <span className="text-sm font-bold text-gray-700">Total: {tenants?.length || 0}</span>
          </div>
        </div>

        {/* CSS Grid para locales (Sin Tablas) */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {tenants?.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <p className="text-gray-500">No hay comercios registrados aún.</p>
            </div>
          ) : (
            tenants?.map((tenant) => (
              <div 
                key={tenant.id} 
                className="bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)] p-5 transition-transform duration-200 ease-in-out hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{tenant.name}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>URL:</strong> <span className="bg-gray-100 px-1 rounded text-blue-600">/{tenant.slug}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>WhatsApp:</strong> {tenant.whatsapp_number}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Creado: {new Date(tenant.created_at).toLocaleDateString()}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
