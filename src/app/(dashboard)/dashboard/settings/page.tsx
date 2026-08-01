import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, Clock } from 'lucide-react'

export default async function SettingsPage() {
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h3 className="font-black text-3xl text-indigo-950">Configuración</h3>
        <p className="text-indigo-900/50 font-bold mt-1 text-sm">Administra las preferencias de tu negocio.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-900/5 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center shadow-inner">
            <Settings className="w-8 h-8 animate-[spin_4s_linear_infinite]" />
          </div>
        </div>
        <h4 className="font-black text-indigo-950 text-2xl mb-2">Próximamente</h4>
        <p className="text-indigo-900/50 font-bold max-w-md mx-auto">
          Estamos construyendo el módulo de configuración donde podrás establecer tus <strong className="text-purple-600">horarios de atención</strong>, turnos disponibles y personalizaciones de tu tienda.
        </p>
        
        <div className="mt-8 flex justify-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-indigo-900/40 bg-indigo-50 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4" /> En desarrollo
          </span>
        </div>
      </div>
    </div>
  )
}
