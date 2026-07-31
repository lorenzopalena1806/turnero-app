'use client'

import { useActionState, useState } from 'react'
import { createTenant } from '@/app/(super-admin)/admin/actions'
import { Plus, X } from 'lucide-react'

type ActionState = {
  error?: string;
  success?: string;
}

const initialState: ActionState = {}

export default function CreateTenantForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createTenant, initialState)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white text-[#2563eb] hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-300"
      >
        <Plus className="w-5 h-5" />
        Nuevo Comercio
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 m-0">Aprovisionar Local</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar text-left">
          {state?.error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {state.success}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-1">1. Credenciales del Propietario</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input name="email" type="email" required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb] transition-colors" placeholder="dueño@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                <input name="password" type="text" required minLength={6} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb] transition-colors" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b pb-1">2. Datos del Local</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                <input name="name" type="text" required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb] transition-colors" placeholder="Peluquería VIP" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio (URL)</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500 font-bold">
                    /
                  </span>
                  <input name="slug" type="text" required placeholder="peluqueria-vip" className="w-full bg-white border border-gray-300 rounded-r-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp de Contacto</label>
                <input name="whatsapp" type="text" required placeholder="Ej: 54911223344" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2563eb] transition-colors" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 py-2.5 bg-[#2563eb] hover:bg-[#1e40af] disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex justify-center items-center gap-2"
              >
                {isPending ? 'Creando...' : 'Crear Local'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
