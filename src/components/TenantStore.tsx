'use client'

import { useCart } from './CartProvider'
import { Plus } from 'lucide-react'

export default function TenantStore({ tenant, services }: { tenant: any, services: any[] }) {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans relative overflow-hidden pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-2 bg-white/[0.03] border border-white/10 rounded-2xl mb-6 backdrop-blur-md">
            <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest rounded-xl">
              Reserva Online
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            {tenant.name}
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Selecciona los servicios que deseas y reserva tu turno rápidamente a través de WhatsApp.
          </p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-xl">
            <p className="text-slate-400 text-lg">Próximamente agregaremos nuestros servicios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/20 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      ${service.price}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => addItem(service)}
                    className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all transform active:scale-95 border border-white/10 group-hover:border-violet-500/30 group-hover:bg-violet-500/10"
                  >
                    <Plus className="w-5 h-5 text-violet-400" />
                    Agregar al turno
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
