import { login } from './actions'
import { LogIn } from 'lucide-react'

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
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[400px]">
        {/* Header simple */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2563eb] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-md">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acceso al Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)] p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-shadow text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-shadow text-sm"
              />
            </div>
            
            <button
              formAction={login}
              className="w-full mt-2 bg-[#2563eb] hover:bg-[#1e40af] text-white rounded-lg py-3 px-4 transition-colors duration-300 font-medium"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
