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
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95 z-40"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-3 -right-3 bg-slate-900 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {items.length}
          </span>
        </div>
      </button>

      {/* Overlay (Glassmorphism) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-50 sm:border-l border-slate-200 z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tu Reserva</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm transition-all hover:shadow-md group">
              <div>
                <p className="font-extrabold text-slate-900">{item.name}</p>
                <p className="text-emerald-600 font-bold mt-1 text-lg leading-none">${item.price}</p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-rose-100"
                title="Quitar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total a pagar</span>
            <span className="text-3xl font-black text-slate-900">${totalPrice}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}
