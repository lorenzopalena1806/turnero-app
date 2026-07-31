import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateTenantForm from '@/components/CreateTenantForm'
import { Scissors, Users, Activity, LogOut } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_super_admin !== true) {
    redirect('/login')
  }

  // Fetch tenants
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Turnero SaaS Control</h1>
              <p className="text-sm text-slate-400">Super Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-300">Sistema Operativo</span>
            </div>
            {/* Si quisieras un botón de logout: */}
            {/* <button className="p-2 text-slate-400 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button> */}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
            <div className="p-4 bg-blue-500/10 rounded-2xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Comercios Activos</p>
              <p className="text-2xl font-bold text-white">{tenants?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
            <div className="p-4 bg-violet-500/10 rounded-2xl">
              <Activity className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Estado de Servidores</p>
              <p className="text-2xl font-bold text-white">Óptimo</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 sm:p-8 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Lista de Tenants (Comercios)</h2>
              <p className="text-sm text-slate-400 mt-1">Gestiona a los clientes de tu plataforma SaaS.</p>
            </div>
            <CreateTenantForm />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre del Local</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Subdominio (Slug)</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Contacto</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha Creación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {tenants?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      No hay comercios registrados aún. Usa el botón de arriba para aprovisionar el primero.
                    </td>
                  </tr>
                ) : (
                  tenants?.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-medium text-white">{tenant.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          /{tenant.slug}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{tenant.whatsapp_number}</td>
                      <td className="py-4 px-6 text-slate-400 text-sm">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
