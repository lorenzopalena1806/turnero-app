'use client'

import { useActionState, useState } from 'react'
import { createTenant } from '@/app/(super-admin)/admin/actions'
import { Plus, X, Rocket } from 'lucide-react'

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
        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Nuevo Comercio</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white relative">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

        <div className="p-6 border-b border-indigo-50/50 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Rocket className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-black text-indigo-950 m-0">Nuevo Local</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-indigo-900/50 hover:text-rose-500 bg-indigo-50/50 hover:bg-rose-50 p-2 rounded-2xl transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar text-left relative z-10">
          {state?.error && (
            <div className="mb-6 p-4 bg-rose-100/80 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold backdrop-blur-sm">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-6 p-4 bg-emerald-100/80 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-bold backdrop-blur-sm">
              {state.success}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/50">1. Acceso del Propietario</h3>
              <div>
                <input name="email" type="email" required className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm" placeholder="Correo Electrónico" />
              </div>
              <div>
                <input name="password" type="text" required minLength={6} className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm" placeholder="Contraseña (Min 6)" />
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/50">2. Detalles Comerciales</h3>
              <div>
                <input name="name" type="text" required className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm" placeholder="Nombre Comercial" />
              </div>
              <div className="flex items-center">
                <span className="bg-indigo-100/50 border-2 border-r-0 border-indigo-100/50 rounded-l-2xl px-5 py-3.5 text-sm text-indigo-900/50 font-bold">
                  /
                </span>
                <input name="slug" type="text" required placeholder="url-tienda" className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-r-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm" />
              </div>
              <div>
                <input name="whatsapp" type="text" required placeholder="WhatsApp de Contacto" className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-3.5 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm" />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-2xl shadow-xl shadow-pink-500/25 font-black hover:-translate-y-1 active:scale-95 transition-all duration-300 text-sm flex justify-center items-center gap-2"
              >
                {isPending ? 'Procesando...' : 'Aprovisionar Tienda'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
