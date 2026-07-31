'use client'

import { useState } from 'react'
import { useCart, CartItem } from './CartProvider'
import CartSidebar from './CartSidebar'
import { ShoppingCart } from 'lucide-react'

type TenantStoreProps = {
  tenant: {
    name: string
    whatsapp_number: string
    ui_settings: any
  }
  services: any[]
}

export default function TenantStore({ tenant, services }: TenantStoreProps) {
  const { addItem, totalItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          {tenant.name}
        </h1>
        <p className="text-neutral-400 text-lg">Selecciona los servicios que deseas reservar</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div 
            key={service.id} 
            className="group relative bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 transition-all hover:bg-neutral-800/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
              <p className="text-sm text-neutral-400 mb-4 h-10 line-clamp-2">{service.description || 'Sin descripción'}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-300 flex items-center gap-1">
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {service.duration_minutes} min
                </span>
                <span className="text-2xl font-bold text-white">${service.price}</span>
              </div>
            </div>

            <button
              onClick={() => addItem({
                id: service.id,
                name: service.name,
                price: service.price,
                quantity: 1,
                duration: service.duration_minutes
              })}
              className="w-full py-3 bg-neutral-800 hover:bg-blue-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600"
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito
            </button>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full text-center py-20 text-neutral-500">
            Este comercio aún no tiene servicios disponibles.
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-2xl shadow-purple-900/40 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-3 bg-white text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-600">
              {totalItems}
            </span>
          </div>
        </button>
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        tenantName={tenant.name}
        whatsappNumber={tenant.whatsapp_number}
      />
    </div>
  )
}
