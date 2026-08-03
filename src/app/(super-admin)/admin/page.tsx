import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateTenantForm from '@/components/CreateTenantForm'
import TenantAdminActions from '@/components/TenantAdminActions'
import { LogOut, Globe, Sparkles } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_super_admin !== true) {
    redirect('/login')
  }

  // Fetch tenants
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-purple-900/10">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none tracking-tight">SuperAdmin</h1>
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest mt-1">Portal Central</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline-flex items-center gap-2 bg-black/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              En Línea
            </span>
            <div className="h-6 w-px bg-white/20"></div>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-all p-2 rounded-xl hover:bg-white/10 active:scale-95">
                <LogOut className="w-5 h-5" />
                <span className="font-bold hidden sm:block">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800">Comercios Activos</h2>
            <p className="text-indigo-900/60 font-bold mt-2 text-lg">Directorio de inquilinos en la plataforma.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/60 backdrop-blur-md border border-white px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-indigo-900/50 uppercase tracking-widest">Total: <span className="text-indigo-900 text-lg ml-1">{tenants?.length || 0}</span></span>
            </div>
            <CreateTenantForm />
          </div>
        </div>

        {/* Grid de locales */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
          {tenants?.length === 0 ? (
            <div className="col-span-full p-16 text-center bg-white/60 backdrop-blur-md border border-white rounded-[2rem] shadow-xl shadow-indigo-900/5">
              <p className="text-lg font-bold text-indigo-900/50">No hay comercios registrados aún.</p>
            </div>
          ) : (
            tenants?.map((tenant) => (
              <div 
                key={tenant.id} 
                className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-indigo-900/5 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-indigo-950">{tenant.name}</h3>
                      {!tenant.is_active && (
                        <span className="inline-block mt-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                          PAUSADO
                        </span>
                      )}
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${tenant.is_active ? 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600' : 'bg-rose-100 text-rose-500'}`}>
                      {tenant.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                      <div className="flex items-center gap-3 text-sm text-indigo-900 font-bold mb-1">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        Dominio Público
                      </div>
                      <p className="text-purple-600 font-black text-lg ml-7">/{tenant.slug}</p>
                    </div>
                    
                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50">
                      <div className="text-xs font-bold text-pink-900/60 uppercase tracking-widest mb-1">
                        WhatsApp
                      </div>
                      <p className="text-pink-600 font-black text-lg">{tenant.whatsapp_number}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-indigo-100/50 flex justify-between items-center relative z-10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/40">
                    ID: {tenant.id.substring(0, 8)}
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-xl">
                    Hace {Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
                  </span>
                </div>

                <div className="relative z-10">
                  <TenantAdminActions 
                    tenantId={tenant.id} 
                    ownerId={tenant.owner_id} 
                    isActive={tenant.is_active !== false} 
                  />
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
