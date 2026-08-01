import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ExternalLink, ClipboardList, Settings, Calendar } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-indigo-950 font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50 shadow-sm shadow-indigo-900/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-black text-white">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-indigo-950 text-xl leading-none">{tenant.name}</h2>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/50 mt-1">Panel de Control</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`/${tenant.slug}`} 
              target="_blank"
              className="hidden sm:flex text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 items-center gap-2"
            >
              Tienda Pública <ExternalLink className="w-4 h-4" />
            </a>
            <div className="h-6 w-px bg-indigo-900/10 mx-2 hidden sm:block"></div>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 text-indigo-900/40 hover:text-rose-500 font-bold text-sm hover:bg-rose-50 px-3 py-2.5 rounded-xl transition-all active:scale-95">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:block">Salir</span>
              </button>
            </form>
          </div>
        </div>
        
        {/* Tabs Bar */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 overflow-x-auto hide-scrollbar">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 py-4 border-b-[3px] border-purple-500 text-purple-600 font-black text-sm whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" />
            Catálogo
          </Link>
          <Link 
            href="/dashboard/agenda" 
            className="flex items-center gap-2 py-4 border-b-[3px] border-transparent text-indigo-900/40 hover:text-indigo-900/70 font-bold text-sm whitespace-nowrap transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Agenda
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-2 py-4 border-b-[3px] border-transparent text-indigo-900/40 hover:text-indigo-900/70 font-bold text-sm whitespace-nowrap transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
        {children}
      </main>

    </div>
  )
}
