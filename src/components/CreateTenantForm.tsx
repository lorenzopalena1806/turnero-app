'use client'

import { useActionState, useState } from 'react'
import { createTenant } from '@/app/(super-admin)/admin/actions'
import { Plus, X } from 'lucide-react'

const initialState = {
  error: '',
  success: '',
}

export default function CreateTenantForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createTenant, initialState)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nuevo Tenant
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Aprovisionar Comercio</h2>
          <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {state.error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {state.success}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Email del Propietario</label>
              <input name="email" type="email" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Contraseña Inicial</label>
              <input name="password" type="text" required minLength={6} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <hr className="border-neutral-800 my-4" />
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Nombre del Comercio</label>
              <input name="name" type="text" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Slug (URL)</label>
              <input name="slug" type="text" required placeholder="mi-peluqueria" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">WhatsApp (con código de país)</label>
              <input name="whatsapp" type="text" required placeholder="54911223344" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {isPending ? 'Creando...' : 'Aprovisionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
