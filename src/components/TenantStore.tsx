'use client'

import { useCart } from './CartProvider'
import { Plus } from 'lucide-react'

import CartSidebar from './CartSidebar'

export default function TenantStore({ tenant, services }: { tenant: any, services: any[] }) {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans pb-32">

      {/* Header Fijo */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40 shadow-sm shadow-indigo-900/5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-2xl font-black text-white">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="font-black text-indigo-950 text-xl leading-none tracking-tight">{tenant.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-900/50 mt-1 block">Reservas Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-2">Nuestro Catálogo</h2>
          <p className="text-sm font-bold text-indigo-900/50">Selecciona los servicios que deseas reservar.</p>
        </div>

        {/* CSS Grid para Servicios */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white/60 backdrop-blur-md border border-white rounded-[2.5rem] shadow-xl shadow-indigo-900/5">
              <p className="text-sm font-bold text-indigo-900/50">Próximamente agregaremos nuestros servicios.</p>
            </div>
          ) : (
            services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 flex flex-col h-full justify-between gap-6 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div>
                  <h3 className="text-xl font-black text-indigo-950 leading-tight mb-2">{service.name}</h3>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-3">
                    ${service.price}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.classList.add('scale-95', 'opacity-75');
                    setTimeout(() => btn.classList.remove('scale-95', 'opacity-75'), 200);
                    addItem(service);
                  }}
                  className="w-full py-4 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 text-indigo-600 hover:text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/30"
                >
                  <Plus className="w-5 h-5" />
                  Agregar al turno
                </button>
              </div>
            ))
          )}
        </div>
      </main>
      <CartSidebar 
        tenantId={tenant.id} 
        tenantName={tenant.name} 
        whatsappNumber={tenant.whatsapp_number} 
      />
    </div>
  )
}
