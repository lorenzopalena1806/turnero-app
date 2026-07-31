import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, LogOut, ExternalLink, Settings, Scissors } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!tenant) {
    redirect('/login?error=no_role')
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-tight leading-tight">{tenant.name}</h2>
            <p className="text-xs text-indigo-400 font-medium">Panel de Control</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 bg-violet-600/10 text-violet-300 rounded-xl font-medium border border-violet-500/20 transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Inicio
          </Link>
          <a 
            href={`/${tenant.slug}`} 
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Ver mi Tienda
          </a>
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all opacity-50 cursor-not-allowed"
            title="Próximamente"
          >
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
            <p className="text-xs text-slate-400 mb-1">Usuario actual</p>
            <p className="text-sm text-white truncate" title={user.email}>{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-medium transition-colors border border-transparent hover:border-red-500/20">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-lg flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-white text-lg">{tenant.name}</h2>
        </div>
        <a 
          href={`/${tenant.slug}`} 
          target="_blank"
          className="p-2 text-indigo-400 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}
