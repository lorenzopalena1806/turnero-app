import { login } from './actions'
import { Hexagon } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  
  let errorMessage = ''
  if (error === 'auth_failed') errorMessage = 'Correo o contraseña incorrectos.'
  else if (error === 'no_role') errorMessage = 'Tu usuario no tiene ningún comercio (tenant) asignado. Contacta al administrador.'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white px-8 py-10 sm:px-10 sm:py-12 rounded-2xl shadow-sm border border-slate-200 relative">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Hexagon className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Acceso Central</h1>
            <p className="text-sm text-slate-500 font-medium">
              Gestión para Administradores y Dueños
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all text-sm font-medium"
                placeholder="usuario@gmail.com"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
            
            <button
              formAction={login}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
