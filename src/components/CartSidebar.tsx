'use client'

import { useCart } from './CartProvider'
import { ShoppingBag, X, MessageCircle } from 'lucide-react'
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
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-5 rounded-2xl shadow-xl shadow-pink-500/40 flex items-center justify-center transition-all hover:-translate-y-2 active:scale-95 z-40"
      >
        <div className="relative">
          <ShoppingBag className="w-7 h-7" />
          <span className="absolute -top-4 -right-4 bg-indigo-950 text-white text-[12px] font-black w-7 h-7 flex items-center justify-center rounded-xl border-2 border-white shadow-sm">
            {items.length}
          </span>
        </div>
      </button>

      {/* Overlay (Glassmorphism) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 transition-all duration-500" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white/90 backdrop-blur-2xl sm:border-l border-white z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-[0_0_40px_rgba(49,46,129,0.2)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Decorative glow inside sidebar */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 border-b border-indigo-50/50 flex items-center justify-between relative z-10 bg-white/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Tu Reserva</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2.5 text-indigo-900/40 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar relative z-10">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white/80 border border-white p-5 rounded-2xl shadow-lg shadow-indigo-900/5 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 group">
              <div>
                <p className="font-black text-indigo-950 text-lg mb-1">{item.name}</p>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-black text-xl leading-none">${item.price}</p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-indigo-900/30 hover:text-rose-600 p-3 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                title="Quitar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-indigo-50/50 bg-white/80 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[12px] text-indigo-900/50 font-black uppercase tracking-widest">Total a pagar</span>
            <span className="text-4xl font-black text-indigo-950">${totalPrice}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full py-5 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
