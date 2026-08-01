'use client'

import { useActionState, useState } from 'react'
import { addServiceAction } from '@/app/(dashboard)/dashboard/actions'
import { Scissors, Plus, Trash2 } from 'lucide-react'

type Variant = {
  name: string
  extra_price: number
  extra_duration: number
}

export default function AddServiceForm({ tenantId }: { tenantId: string }) {
  const [state, formAction, isPending] = useActionState(addServiceAction, null)
  const [variants, setVariants] = useState<Variant[]>([])

  const addVariant = () => {
    setVariants([...variants, { name: '', extra_price: 0, extra_duration: 15 }])
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = (formData: FormData) => {
    formData.append('variants', JSON.stringify(variants))
    formAction(formData)
    // small hack to reset variants after submit, though not ideal without knowing success
    // A better approach would be useEffect on state.success, but we stick to MVP.
  }

  return (
    <form action={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-900/5">
      <input type="hidden" name="tenant_id" value={tenantId} />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-black text-indigo-950 text-2xl leading-none">Nuevo Servicio</h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/50 mt-1">Agrega al catálogo</p>
        </div>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 bg-rose-100/80 text-rose-700 rounded-2xl text-sm font-bold border border-rose-200">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Nombre</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="Corte Clásico"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Precio Base ($)</label>
            <input 
              type="number" 
              name="price" 
              step="0.01" 
              required 
              placeholder="1500.00"
              className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Duración (min)</label>
            <input 
              type="number" 
              name="duration_minutes" 
              step="5"
              min="5" 
              required 
              placeholder="30"
              className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
            />
          </div>
        </div>

        {/* Variants Section */}
        <div className="mt-8 pt-6 border-t border-indigo-50">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest ml-1">Variantes / Agregados (Opcional)</label>
            <button type="button" onClick={addVariant} className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
          
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-indigo-50/30 rounded-xl border border-indigo-50">
                <input 
                  type="text" 
                  placeholder="Ej: Lavado" 
                  value={v.name}
                  onChange={e => updateVariant(i, 'name', e.target.value)}
                  className="flex-1 min-w-0 bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm font-bold text-indigo-950"
                  required
                />
                <input 
                  type="number" 
                  placeholder="+$0" 
                  value={v.extra_price}
                  onChange={e => updateVariant(i, 'extra_price', parseFloat(e.target.value))}
                  className="w-20 bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm font-bold text-indigo-950"
                  required
                />
                <input 
                  type="number" 
                  placeholder="+15m" 
                  value={v.extra_duration}
                  onChange={e => updateVariant(i, 'extra_duration', parseInt(e.target.value))}
                  className="w-16 bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm font-bold text-indigo-950"
                  required
                />
                <button type="button" onClick={() => removeVariant(i)} className="text-rose-400 hover:text-rose-600 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-xs font-bold text-indigo-900/30 text-center py-4 border-2 border-dashed border-indigo-50 rounded-xl">
                No hay variantes configuradas.
              </p>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full mt-8 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-purple-500/25 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          {isPending ? 'Guardando...' : 'Crear Servicio'}
        </button>
      </div>
    </form>
  )
}
