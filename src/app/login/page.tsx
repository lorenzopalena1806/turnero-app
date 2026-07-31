import { login } from './actions'
import { Store } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
      
      <div className="w-full max-w-md">
        <div className="bg-white px-8 py-10 sm:px-12 sm:py-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-[#0F9D58] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <span className="text-2xl font-extrabold text-white">T</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-[1.75rem] font-bold text-slate-800 mb-2">Iniciar Sesión Central</h1>
            <p className="text-[0.95rem] text-slate-500 leading-relaxed">
              Acceso unificado para SuperAdmin, Dueño de Local y Empleados
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2" htmlFor="email">
                Email de Usuario
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-[#E8F0FE]/60 border-none rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all text-sm font-medium"
                placeholder="usuario@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-[#E8F0FE]/60 border-none rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
            
            <button
              formAction={login}
              className="w-full mt-2 bg-[#0F9D58] hover:bg-[#0d8a4d] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
