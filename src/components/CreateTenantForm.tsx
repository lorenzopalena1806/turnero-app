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
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Nuevo Comercio</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <Building2 className="w-4 h-4" />
             </div>
             <h2 className="text-lg font-extrabold text-slate-900 m-0">Aprovisionar Local</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar text-left bg-slate-50/30">
          {state?.error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
              {state.success}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200 pb-2">1. Credenciales del Propietario</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo Electrónico</label>
                <input name="email" type="email" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-sm" placeholder="dueño@ejemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contraseña Inicial</label>
                <input name="password" type="text" required minLength={6} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-sm" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200 pb-2">2. Datos del Local</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre Comercial</label>
                <input name="name" type="text" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-sm" placeholder="Peluquería VIP" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subdominio (URL)</label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-4 py-2.5 text-sm text-slate-500 font-bold">
                    /
                  </span>
                  <input name="slug" type="text" required placeholder="peluqueria-vip" className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp de Contacto</label>
                <input name="whatsapp" type="text" required placeholder="Ej: 54911223344" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-sm" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold transition-all active:scale-95 text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-emerald-600/20 font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm flex justify-center items-center gap-2"
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
