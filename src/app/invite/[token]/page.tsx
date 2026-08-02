import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import InviteForm from './InviteForm'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('staff_invites')
    .select('*, staff(name), tenants(name, theme_color)')
    .eq('token', token)
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Invitación Inválida</h1>
          <p className="text-slate-500 font-bold mb-6">El enlace no existe o es incorrecto.</p>
        </div>
      </div>
    )
  }

  if (invite.used) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Invitación Usada</h1>
          <p className="text-slate-500 font-bold mb-6">Este enlace ya fue utilizado para crear una cuenta.</p>
          <a href="/login" className="text-indigo-600 font-black hover:underline">Ir a Iniciar Sesión</a>
        </div>
      </div>
    )
  }

  const isExpired = new Date(invite.expires_at) < new Date()
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Invitación Expirada</h1>
          <p className="text-slate-500 font-bold mb-6">El enlace ha expirado. Pide que te envíen uno nuevo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full border-2 border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-lg mb-4">
            {invite.staff.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Hola, {invite.staff.name}</h1>
          <p className="text-slate-500 font-bold mt-2 text-sm">
            Te han invitado a unirte al equipo de <span className="text-slate-900 font-black">{invite.tenants.name}</span>
          </p>
        </div>

        <InviteForm token={token} />
      </div>
    </div>
  )
}
