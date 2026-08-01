'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { addServiceAction } from '@/app/(dashboard)/dashboard/actions'

export default function AddServiceForm({ tenantId }: { tenantId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addServiceAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // success, clear form
        const form = document.getElementById('add-service-form') as HTMLFormElement
        if (form) form.reset()
      }
    })
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5 sticky top-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 flex items-center justify-center shadow-inner">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-black text-indigo-950 text-lg leading-none">Agregar Servicio</h3>
          <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/40 mt-1">Nuevo ítem</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-100/80 text-rose-700 rounded-2xl text-sm font-bold border border-rose-200 backdrop-blur-sm">
          {error}
        </div>
      )}
      
      <form id="add-service-form" onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="tenant_id" value={tenantId} />
        <div>
          <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Nombre del Servicio</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="Ej. Corte Clásico"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Precio ($)</label>
          <input 
            type="number" 
            name="price" 
            step="0.01" 
            required 
            placeholder="1500.00"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all font-bold text-sm"
          />
        </div>
        <button 
          type="submit"
          disabled={isPending}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/25 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 text-sm disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar Servicio'}
        </button>
      </form>
    </div>
  )
}
