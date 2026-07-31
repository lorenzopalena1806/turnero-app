import { login } from './actions'

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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-neutral-900/50 backdrop-blur-xl p-8 rounded-2xl border border-neutral-800 shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-neutral-400">Ingresa a tu panel de control</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            formAction={login}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98]"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          Usa tus credenciales de propietario o super administrador.
        </div>
      </div>
    </div>
  )
}
