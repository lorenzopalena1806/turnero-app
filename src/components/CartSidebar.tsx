'use client'

import { useCart } from './CartProvider'
import { ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'

export default function CartSidebar({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, removeItem, totalPrice } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  if (items.length === 0) return null

  const handleCheckout = () => {
    let text = "Hola, me gustaría reservar un turno para los siguientes servicios:\n\n"
    items.forEach(item => {
      text += `- ${item.name} ($${item.price})\n`
    })
    text += `\n*Total: $${totalPrice}*`
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#2563eb] hover:bg-[#1e40af] text-white p-4 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.4)] flex items-center justify-center transition-colors duration-300 z-40"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {items.length}
          </span>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#f9f9f9] sm:border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-[#2563eb] text-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold m-0">Tu Reserva</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
              <div>
                <p className="font-bold text-gray-800 m-0">{item.name}</p>
                <p className="text-[#2563eb] font-bold mt-1 m-0">${item.price}</p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                title="Quitar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-bold uppercase text-sm">Total</span>
            <span className="text-2xl font-bold text-gray-800">${totalPrice}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1e40af] text-white font-bold rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
          >
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
