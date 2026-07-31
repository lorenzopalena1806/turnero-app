'use client'

import { useActionState, useState } from 'react'
import { createTenant } from '@/app/(super-admin)/admin/actions'
import { Plus, X, Sparkles } from 'lucide-react'

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
        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-500/25"
      >
        <Plus className="w-4 h-4" />
        Nuevo Tenant
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative shadow-indigo-500/10">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[20%] bg-violet-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Aprovisionar Comercio</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto relative z-10 custom-scrollbar">
          {state?.error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium shadow-inner">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm font-medium shadow-inner">
              {state.success}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Credenciales del Propietario</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo Electrónico</label>
                <input name="email" type="email" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-slate-600" placeholder="dueño@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña Inicial</label>
                <input name="password" type="text" required minLength={6} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-slate-600" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            
            <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Datos del Local</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de la Peluquería</label>
                <input name="name" type="text" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-slate-600" placeholder="Peluquería VIP" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Subdominio (URL)</label>
                <div className="flex items-center">
                  <span className="bg-black/60 border border-r-0 border-white/10 rounded-l-xl px-3 py-2.5 text-sm text-slate-500">
                    /
                  </span>
                  <input name="slug" type="text" required placeholder="peluqueria-vip" className="w-full bg-black/40 border border-white/10 rounded-r-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-slate-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">WhatsApp de Contacto</label>
                <input name="whatsapp" type="text" required placeholder="Ej: 54911223344" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-slate-600" />
                <p className="text-xs text-slate-500 mt-1">Con código de país, sin signos de +. Aquí llegarán las reservas.</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors text-sm font-semibold"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm font-semibold flex justify-center items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Crear y Aprovisionar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
