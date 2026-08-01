'use client'

import { useActionState, useState, useEffect } from 'react'
import { editServiceAction } from '@/app/(dashboard)/dashboard/actions'
import { Edit2, Plus, Trash2, X } from 'lucide-react'

type Variant = {
  name: string
  extra_price: number
  extra_duration: number
}

export default function EditServiceModal({ service, tenantId }: { service: any, tenantId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(editServiceAction, null)
  
  // Safely parse variants or fallback to empty array
  const initialVariants = Array.isArray(service.variants) ? service.variants : []
  const [variants, setVariants] = useState<Variant[]>(initialVariants)

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false)
    }
  }, [state])

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
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-indigo-900/30 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl transition-all active:scale-95"
        title="Editar"
      >
        <Edit2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="font-black text-indigo-950 text-xl">Editar Servicio</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="tenant_id" value={tenantId} />

                {state?.error && (
                  <div className="p-4 bg-rose-100/80 text-rose-700 rounded-2xl text-sm font-bold border border-rose-200">
                    {state.error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    defaultValue={service.name}
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
                      defaultValue={service.price}
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
                      defaultValue={service.duration_minutes}
                      className="w-full bg-indigo-50/50 border-2 border-indigo-100/50 rounded-2xl px-5 py-4 text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
                    />
                  </div>
                </div>

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

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-purple-500/25 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
