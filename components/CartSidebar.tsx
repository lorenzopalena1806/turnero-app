'use client'

import { useCart } from './CartProvider'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'

type CartSidebarProps = {
  isOpen: boolean
  onClose: () => void
  tenantName: string
  whatsappNumber: string
}

export default function CartSidebar({ isOpen, onClose, tenantName, whatsappNumber }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()

  const handleCheckout = () => {
    // Generate WhatsApp Message
    const header = `¡Hola! Quiero reservar los siguientes servicios en *${tenantName}*:%0A%0A`
    
    const body = items.map(item => 
      `🔹 ${item.quantity}x ${item.name} - $${item.price * item.quantity}`
    ).join('%0A')

    const footer = `%0A%0A*Total: $${totalPrice}*%0A_Por favor, confírmame la disponibilidad._`
    
    const message = header + body + footer
    
    const waLink = `https://wa.me/${whatsappNumber}?text=${message}`
    
    // Redirect to WhatsApp
    window.open(waLink, '_blank')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900 border-l border-neutral-800 z-50 shadow-2xl flex flex-col transform transition-transform">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            Tu Reserva
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex flex-col gap-3 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-neutral-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-semibold">${item.price * item.quantity}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-neutral-400">Total ({totalItems} items)</span>
              <span className="text-2xl font-bold text-white">${totalPrice}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              Reservar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  )
}
