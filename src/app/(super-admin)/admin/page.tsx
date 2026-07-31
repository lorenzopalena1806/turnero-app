import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateTenantForm from '@/components/CreateTenantForm'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_super_admin !== true) {
    redirect('/login')
  }

  // Fetch tenants
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Gestión de Tenants</h1>
        <p className="text-neutral-400 mt-2">Aprovisionamiento y supervisión de comercios afiliados.</p>
      </header>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Lista de Comercios</h2>
          <CreateTenantForm />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                <th className="py-3 font-medium">Nombre</th>
                <th className="py-3 font-medium">Slug</th>
                <th className="py-3 font-medium">WhatsApp</th>
                <th className="py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants && tenants.length > 0 ? (
                tenants.map(tenant => (
                  <tr key={tenant.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                    <td className="py-4 text-neutral-200">{tenant.name}</td>
                    <td className="py-4 text-neutral-400">/{tenant.slug}</td>
                    <td className="py-4 text-neutral-400">{tenant.whatsapp_number}</td>
                    <td className="py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">Editar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-500">
                    No hay tenants registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
