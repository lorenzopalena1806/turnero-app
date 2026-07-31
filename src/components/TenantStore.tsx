'use client'

import { useCart } from './CartProvider'

export default function TenantStore({ tenant, services }: { tenant: any, services: any[] }) {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#333] font-sans pb-32">

      {/* Header Fijo */}
      <header className="sticky top-0 z-40 bg-[#2563eb] text-white shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
          <h1 className="text-xl font-bold m-0">{tenant.name}</h1>
          <p className="text-sm opacity-80 m-0">Reservas Online</p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nuestros Servicios</h2>
          <p className="text-gray-500 text-sm mt-1">Selecciona los servicios que deseas reservar.</p>
        </div>

        {/* CSS Grid para Servicios */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
              <p className="text-gray-500">Próximamente agregaremos nuestros servicios.</p>
            </div>
          ) : (
            services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.1)] p-5 transition-transform duration-200 ease-in-out hover:scale-[1.02] flex flex-col justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{service.name}</h3>
                  <p className="text-2xl font-bold text-[#2563eb]">
                    ${service.price}
                  </p>
                </div>
                
                <button
                  onClick={() => addItem(service)}
                  className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1e40af] text-white rounded-lg font-medium transition-colors duration-300"
                >
                  Agregar
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
