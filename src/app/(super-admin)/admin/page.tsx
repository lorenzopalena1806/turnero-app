import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateTenantForm from '@/components/CreateTenantForm'
import { Store, ShieldCheck, Users } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_super_admin !== true) {
    redirect('/login')
  }

  // Fetch tenants
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header (Light Mode) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel SuperAdmin</h1>
              <p className="text-sm text-slate-500">Gestión central de comercios</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-emerald-700">Sistema Operativo</span>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl flex items-center gap-4 shadow-sm border border-slate-200">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Comercios Activos</p>
              <p className="text-2xl font-bold text-slate-800">{tenants?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl flex items-center gap-4 shadow-sm border border-slate-200">
            <div className="p-4 bg-purple-50 rounded-2xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Usuarios Totales</p>
              <p className="text-2xl font-bold text-slate-800">{tenants?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Content (Table) */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Directorio de Locales</h2>
              <p className="text-sm text-slate-500 mt-1">Lista completa de inquilinos (tenants).</p>
            </div>
            <CreateTenantForm />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Local</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">URL Pública</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      No hay comercios. Haz clic en "Nuevo Comercio" para empezar.
                    </td>
                  </tr>
                ) : (
                  tenants?.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800">{tenant.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          /{tenant.slug}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{tenant.whatsapp_number}</td>
                      <td className="py-4 px-6 text-slate-500 text-sm">
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
