'use client'

import { useCart } from './CartProvider'
import { Plus } from 'lucide-react'

export default function TenantStore({ tenant, services }: { tenant: any, services: any[] }) {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-32">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <span className="text-xl font-bold text-[#0F9D58]">{tenant.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-none">{tenant.name}</h1>
              <span className="text-[11px] text-slate-500 font-medium">Reservas Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Catálogo de Servicios</h2>
          <p className="text-slate-500">Selecciona los servicios que deseas reservar.</p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <p className="text-slate-500 font-medium">Próximamente agregaremos nuestros servicios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{service.name}</h3>
                  <p className="text-2xl font-black text-[#0F9D58]">
                    ${service.price}
                  </p>
                </div>
                
                <button
                  onClick={() => addItem(service)}
                  className="w-full py-3 bg-[#E8F0FE]/60 hover:bg-[#0F9D58] text-[#0F9D58] hover:text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Agregar al turno
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
