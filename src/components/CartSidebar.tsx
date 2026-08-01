'use client'

import { useCart } from './CartProvider'
import { ShoppingBag, X, Calendar, Clock, User, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAvailableSlots, createBooking } from '@/app/[tenant_slug]/booking-actions'
import { format, addDays } from 'date-fns'

type Props = {
  tenantId: string
  tenantName: string
  whatsappNumber: string
}

export default function CartSidebar({ tenantId, tenantName, whatsappNumber }: Props) {
  const { items, removeItem, totalPrice, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Cart, 2: Date, 3: Time, 4: Info

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalDuration = items.reduce((acc, item) => acc + (item.duration || 30), 0)

  if (items.length === 0 && !isOpen) return null

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setIsLoadingSlots(true)
    const slots = await getAvailableSlots(tenantId, date, totalDuration)
    setAvailableSlots(slots)
    setIsLoadingSlots(false)
    setStep(3)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await createBooking({
      tenantId,
      customerName,
      customerPhone,
      date: selectedDate,
      time: selectedTime,
      totalDuration,
      totalPrice,
      services: items
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    // Success! Prepare WhatsApp message
    let text = `Hola *${tenantName}*! Acabo de reservar un turno a través de la web.\n\n`
    text += `*Cliente:* ${customerName}\n`
    text += `*Día:* ${selectedDate}\n`
    text += `*Hora:* ${selectedTime}\n\n`
    text += `*Servicios:*\n`
    items.forEach(item => {
      text += `- ${item.name} ($${item.price})\n`
    })
    text += `\n*Total a pagar: $${totalPrice}*`
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    
    clearCart()
    setIsOpen(false)
    setStep(1)
    setIsSubmitting(false)
  }

  // Generate next 14 days for selection
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i)
    return {
      date: format(d, 'yyyy-MM-dd'),
      display: format(d, 'dd/MM')
    }
  })

  return (
    <>
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

      {isOpen && (
        <div 
          className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 transition-all duration-500" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white/90 backdrop-blur-2xl sm:border-l border-white z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-[0_0_40px_rgba(49,46,129,0.2)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="p-8 border-b border-indigo-50/50 flex items-center justify-between relative z-10 bg-white/50">
          <div className="flex items-center gap-4">
            {step === 1 ? (
              <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
                <ShoppingBag className="w-6 h-6" />
              </div>
            ) : (
              <button 
                onClick={() => setStep(prev => (prev - 1) as any)}
                className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors font-black"
              >
                ←
              </button>
            )}
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">
              {step === 1 && 'Tu Reserva'}
              {step === 2 && 'Elige un Día'}
              {step === 3 && 'Elige la Hora'}
              {step === 4 && 'Tus Datos'}
            </h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2.5 text-indigo-900/40 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar relative z-10">
          
          {step === 1 && (
            <>
              {items.length === 0 ? (
                <div className="text-center text-indigo-900/50 font-bold py-10">Tu carrito está vacío.</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white/80 border border-white p-5 rounded-2xl shadow-lg shadow-indigo-900/5 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 group">
                    <div>
                      <p className="font-black text-indigo-950 text-lg mb-1">{item.name}</p>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-black text-xl leading-none">${item.price}</p>
                      <p className="text-xs font-bold text-indigo-900/40 mt-1">{item.duration || 30} min</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-indigo-900/30 hover:text-rose-600 p-3 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {days.map(day => (
                <button
                  key={day.date}
                  onClick={() => handleDateSelect(day.date)}
                  className="bg-white border-2 border-indigo-50 hover:border-purple-300 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
                >
                  <Calendar className="w-6 h-6 text-purple-500" />
                  <span className="font-black text-indigo-950">{day.display}</span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              {isLoadingSlots ? (
                <div className="text-center py-10 font-bold text-indigo-900/50 animate-pulse">Buscando horarios...</div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-10 font-bold text-rose-500 bg-rose-50 rounded-2xl">
                  No hay horarios disponibles para este día. Por favor elige otro.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time)
                        setStep(4)
                      }}
                      className="bg-white border-2 border-indigo-50 hover:border-purple-300 py-3 rounded-2xl flex flex-col items-center justify-center transition-all hover:-translate-y-1 shadow-sm font-black text-indigo-950"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                  <input 
                    type="text" 
                    required 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white border-2 border-indigo-100 rounded-2xl pl-12 pr-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 font-bold text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
                <input 
                  type="text" 
                  required 
                  placeholder="+54 9 11 1234 5678"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 font-bold text-sm"
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm border border-rose-100">
                  {error}
                </div>
              )}

              <div className="bg-indigo-50 rounded-2xl p-5 mt-6 border border-indigo-100/50">
                <h4 className="font-black text-indigo-950 mb-3 text-sm">Resumen de tu Turno</h4>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900/70 mb-1">
                  <Calendar className="w-4 h-4" /> {selectedDate}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900/70 mb-3">
                  <Clock className="w-4 h-4" /> {selectedTime} ({totalDuration} min)
                </div>
                <div className="border-t border-indigo-100 pt-3 flex justify-between">
                  <span className="font-black text-indigo-950">Total</span>
                  <span className="font-black text-purple-600">${totalPrice}</span>
                </div>
              </div>
            </form>
          )}

        </div>

        <div className="p-8 border-t border-indigo-50/50 bg-white/80 relative z-10">
          {step === 1 && items.length > 0 && (
            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              Elegir Horario
            </button>
          )}
          {step === 4 && (
            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Confirmando...' : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Confirmar Turno
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
