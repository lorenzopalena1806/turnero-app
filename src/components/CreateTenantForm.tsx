'use client'

import { useActionState, useState } from 'react'
import { createTenant } from '@/app/(super-admin)/admin/actions'
import { Plus, X, Building2 } from 'lucide-react'

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
        className="bg-[#0F9D58] hover:bg-[#0d8a4d] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Nuevo Comercio
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Aprovisionar Local</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium">
              {state.success}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Credenciales del Propietario</h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Correo Electrónico</label>
                <input name="email" type="email" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all placeholder-slate-400" placeholder="dueño@ejemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Contraseña Inicial</label>
                <input name="password" type="text" required minLength={6} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all placeholder-slate-400" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Datos del Local</h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nombre Comercial</label>
                <input name="name" type="text" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all placeholder-slate-400" placeholder="Peluquería VIP" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Subdominio (URL)</label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2.5 text-sm text-slate-500 font-bold">
                    /
                  </span>
                  <input name="slug" type="text" required placeholder="peluqueria-vip" className="w-full bg-white border border-slate-200 rounded-r-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all placeholder-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">WhatsApp de Contacto</label>
                <input name="whatsapp" type="text" required placeholder="Ej: 54911223344" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/50 transition-all placeholder-slate-400" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-semibold"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 py-3 bg-[#0F9D58] hover:bg-[#0d8a4d] disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors text-sm font-semibold flex justify-center items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  'Aprovisionar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
