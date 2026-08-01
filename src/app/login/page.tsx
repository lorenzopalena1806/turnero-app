import { login } from './actions'
import { Sparkles } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      
      <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 blur-3xl opacity-20 rounded-[3rem]"></div>

        <div className="bg-white/80 backdrop-blur-xl px-8 py-10 sm:px-10 sm:py-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10">
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-500/30 transform rotate-3">
              <Sparkles className="w-8 h-8 text-white -rotate-3" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-2">Bienvenido</h1>
            <p className="text-sm text-purple-600/80 font-semibold">
              Accede a tu portal de administración
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-100/80 text-rose-700 rounded-2xl text-sm font-bold border border-rose-200 backdrop-blur-sm text-center">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-widest mb-2 ml-1" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-white/50 border-2 border-indigo-100 rounded-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-widest mb-2 ml-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-white/50 border-2 border-indigo-100 rounded-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
                placeholder="••••••••"
              />
            </div>
            
            <button
              formAction={login}
              className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
