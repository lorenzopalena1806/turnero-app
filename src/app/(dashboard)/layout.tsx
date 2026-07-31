import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ExternalLink, Settings, ClipboardList, Store } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) redirect('/login?error=no_role')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
              <span className="text-xl font-extrabold text-emerald-600">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 leading-none">{tenant.name}</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Panel de Control</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <a 
                href={`/${tenant.slug}`} 
                target="_blank"
                className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
              >
                Tienda Pública <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold text-sm bg-white hover:bg-rose-50 px-3 py-2 rounded-xl border border-transparent hover:border-rose-100 transition-all active:scale-95">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Salir</span>
              </button>
            </form>
          </div>
        </div>
        
        {/* Tabs Bar */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-8 overflow-x-auto hide-scrollbar">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 py-3 border-b-2 border-emerald-600 text-emerald-600 font-bold text-sm whitespace-nowrap transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Catálogo de Servicios
          </Link>
          <button className="flex items-center gap-2 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold text-sm whitespace-nowrap transition-colors">
            <Store className="w-4 h-4 text-slate-400" />
            Configuración del Local
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </main>

    </div>
  )
}
