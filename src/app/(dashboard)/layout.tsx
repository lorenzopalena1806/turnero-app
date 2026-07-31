import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ExternalLink, Settings, ClipboardList, PackageSearch } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
              <span className="text-xl font-bold text-[#0F9D58]">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 leading-none">{tenant.name}</h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Panel de Control Unificado</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Horario Automático
              </span>
              <a 
                href={`/${tenant.slug}`} 
                target="_blank"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                Ver Tienda Pública <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="text-xs font-semibold text-slate-600 flex gap-4">
              <span className="border-b-2 border-slate-800 pb-1 cursor-pointer">Modo Dueño</span>
              <span className="text-slate-400 cursor-pointer hover:text-slate-600">Modo Staff</span>
            </div>
          </div>
        </div>
        
        {/* Tabs Bar */}
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-8 overflow-x-auto custom-scrollbar">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 py-3 border-b-2 border-[#0F9D58] text-[#0F9D58] font-semibold text-sm whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" />
            Catálogo & Servicios
            <span className="bg-[#0F9D58]/10 text-[#0F9D58] px-2 py-0.5 rounded-full text-xs">29</span>
          </Link>
          <button className="flex items-center gap-2 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
            <PackageSearch className="w-4 h-4 text-orange-400" />
            Categorías
          </button>
          <button className="flex items-center gap-2 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
            <Settings className="w-4 h-4 text-pink-400" />
            Personalización & Ajustes
          </button>
          <div className="flex-1"></div>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 py-3 text-red-500 hover:text-red-600 font-medium text-sm whitespace-nowrap">
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-8">
        {children}
      </main>

    </div>
  )
}
