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
      {/* Floating Action Button (Mobile & Desktop) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_0_40px_rgba(124,58,237,0.5)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40 animate-bounce"
        style={{ animationIterationCount: 3 }}
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-600">
            {items.length}
          </span>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm z-50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0B0F19] sm:border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Tu Turno</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {items.map((item, index) => (
            <div key={item.id} className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-4 rounded-2xl group hover:bg-white/[0.05] transition-colors">
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-indigo-400 font-bold mt-0.5">${item.price}</p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-medium">Total a pagar</span>
            <span className="text-3xl font-extrabold text-white">${totalPrice}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
