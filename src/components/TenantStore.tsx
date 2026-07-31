'use client'

import { useCart } from './CartProvider'
import { Plus } from 'lucide-react'

export default function TenantStore({ tenant, services }: { tenant: any, services: any[] }) {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">

      {/* Header Fijo */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
              <span className="text-xl font-extrabold text-emerald-600">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 leading-none tracking-tight">{tenant.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-1 block">Reservas Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Nuestro Catálogo</h2>
          <p className="text-sm font-medium text-slate-500">Selecciona los servicios que deseas reservar.</p>
        </div>

        {/* CSS Grid para Servicios */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <p className="text-sm font-medium text-slate-500">Próximamente agregaremos nuestros servicios.</p>
            </div>
          ) : (
            services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full justify-between gap-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{service.name}</h3>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    ${service.price}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.classList.add('ring-4', 'ring-emerald-400', 'opacity-75', 'scale-95');
                    setTimeout(() => {
                      btn.classList.remove('ring-4', 'ring-emerald-400', 'opacity-75', 'scale-95');
                    }, 200);
                    addItem(service);
                  }}
                  className="w-full py-3.5 bg-slate-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Agregar al turno
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
