import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateTenantForm from '@/components/CreateTenantForm'
import { LogOut, LayoutDashboard, Globe, MessageCircle } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_super_admin !== true) {
    redirect('/login')
  }

  // Fetch tenants
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-none">SuperAdmin</h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">Control Central</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Operativo
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50 active:scale-95">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:block">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Comercios Registrados</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Directorio de inquilinos en la plataforma.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total: <span className="text-slate-900">{tenants?.length || 0}</span></span>
            </div>
            <CreateTenantForm />
          </div>
        </div>

        {/* Grid de locales */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {tenants?.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-sm font-medium text-slate-500">No hay comercios registrados aún. Crea el primero.</p>
            </div>
          ) : (
            tenants?.map((tenant) => (
              <div 
                key={tenant.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-extrabold text-slate-900">{tenant.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                      Activo
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">URL:</span>
                      <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-900">/{tenant.slug}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Contacto:</span>
                      <span className="text-slate-900">{tenant.whatsapp_number}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    ID: {tenant.id.substring(0, 8)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Creado {new Date(tenant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
