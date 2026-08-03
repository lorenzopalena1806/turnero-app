'use client'

import { useCart } from './CartProvider'
import { useState, useTransition } from 'react'
import { X, Calendar, Clock, User, Trash2, ArrowRight } from 'lucide-react'
import { addDays, format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAvailableSlots, createMultipleBookings } from '@/app/[tenant_slug]/booking-actions'

type CheckoutStep = 'CART' | 'ASSIGNING' | 'INFO' | 'CONFIRM'

interface ItemSelection {
  cartItemId: string
  serviceName: string
  price: number
  duration: number
  staffId: string | null
  date: Date | null
  time: string | null
  customerName: string
  originalService: any
}

export default function CartSidebar({ tenantId, tenantName, whatsappNumber, staff, themeColor, staffLabel }: { tenantId: string, tenantName: string, whatsappNumber: string, staff: any[], themeColor: string, staffLabel: string }) {
  const { items, isOpen, setIsOpen, removeItem, clearCart, totalPrice, totalItems } = useCart()
  const [step, setStep] = useState<CheckoutStep>('CART')
  
  const [selections, setSelections] = useState<ItemSelection[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')

  if (items.length === 0 && !isOpen) return null

  const resetFlow = () => {
    setStep('CART')
    setSelections([])
    setCurrentItemIndex(0)
    setError('')
  }

  const handleClose = () => {
    setIsOpen(false)
    if (items.length === 0) resetFlow()
  }

  const startCheckout = () => {
    // Unroll the cart items based on their quantity
    const initialSelections: ItemSelection[] = []
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        initialSelections.push({
          cartItemId: item.id,
          serviceName: item.name,
          price: item.price,
          duration: item.duration || 30, // CartProvider sets duration_minutes to duration
          staffId: null,
          date: null,
          time: null,
          customerName: '',
          originalService: item
        })
      }
    })
    setSelections(initialSelections)
    setCurrentItemIndex(0)
    setStep('ASSIGNING')
  }

  const currentSelection = selections[currentItemIndex]

  const updateCurrentSelection = (data: Partial<ItemSelection>) => {
    const newSelections = [...selections]
    newSelections[currentItemIndex] = { ...newSelections[currentItemIndex], ...data }
    setSelections(newSelections)
  }

  const handleStaffSelect = (staffId: string) => {
    updateCurrentSelection({ staffId, date: null, time: null })
  }

  const handleDateSelect = (date: Date) => {
    updateCurrentSelection({ date, time: null })
    const dateString = format(date, 'yyyy-MM-dd')
    
    startTransition(async () => {
      const staffId = currentSelection.staffId
      if (!staffId) return
      let slots = await getAvailableSlots(tenantId, dateString, currentSelection.duration, staffId)
      
      // Filter out slots that conflict with other selections already made in this cart
      const otherSelections = selections.filter((s, idx) => 
        idx !== currentItemIndex && 
        s.staffId === staffId && 
        s.date && format(s.date, 'yyyy-MM-dd') === dateString && 
        s.time
      )

      if (otherSelections.length > 0) {
        slots = slots.filter(slot => {
          const slotStart = new Date(`${dateString}T${slot}:00`)
          const slotEnd = new Date(slotStart.getTime() + currentSelection.duration * 60000)

          const isOverlapping = otherSelections.some(other => {
            const otherStart = new Date(`${dateString}T${other.time}:00`)
            const otherEnd = new Date(otherStart.getTime() + other.duration * 60000)
            return (slotStart < otherEnd && slotEnd > otherStart)
          })

          return !isOverlapping
        })
      }

      setAvailableSlots(slots)
    })
  }

  const handleTimeSelect = (time: string) => {
    updateCurrentSelection({ time })
  }

  const nextItemOrInfo = () => {
    if (!currentSelection.staffId || !currentSelection.date || !currentSelection.time || !currentSelection.customerName) {
      setError('Por favor completa todos los datos (Peluquero, Fecha, Horario y Nombre) antes de continuar.')
      return
    }
    setError('')
    
    if (currentItemIndex < selections.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
      setAvailableSlots([])
    } else {
      setStep('INFO')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      // Build bookings payload
      const bookings = selections.map(sel => {
        return {
          tenantId,
          staffId: sel.staffId!,
          customerName: sel.customerName,
          customerPhone: customerPhone,
          date: format(sel.date!, 'yyyy-MM-dd'),
          time: sel.time!,
          totalPrice: sel.price,
          totalDuration: sel.duration,
          services: [sel.originalService]
        }
      })

      const result = await createMultipleBookings(bookings)

      if (result.error) {
        setError(result.error)
      } else {
        // Enviar a WhatsApp
        let msg = `Hola! Quiero reservar los siguientes turnos en ${tenantName}:\n\n`
        
        selections.forEach((sel, idx) => {
          const staffName = staff.find(s => s.id === sel.staffId)?.name
          const dateStr = format(sel.date!, 'dd/MM/yyyy')
          msg += `🔹 ${idx + 1}. ${sel.serviceName}\n`
          msg += `   Para: ${sel.customerName}\n`
          msg += `   Con: ${staffName}\n`
          msg += `   Cuándo: ${dateStr} a las ${sel.time}\n\n`
        })
        
        msg += `💰 Total: $${totalPrice}\n📞 Mi teléfono de contacto es: ${customerPhone}`
        
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
        
        clearCart()
        setIsOpen(false)
        resetFlow()
      }
    })
  }

  // Generate next 14 days
  const allDays = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i))
  
  // Filter by staff schedule for the CURRENT selection
  const selectedStaffMember = staff.find(s => s.id === currentSelection?.staffId)
  const workingDaysOfWeek = selectedStaffMember?.staff_schedules
    ?.filter((s: any) => s.is_working)
    .map((s: any) => s.day_of_week)

  const days = allDays.filter(d => {
    if (!workingDaysOfWeek || workingDaysOfWeek.length === 0) return true
    return workingDaysOfWeek.includes(d.getDay())
  })

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col border-l border-slate-100 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
              {step === 'CART' && 'Tu Reserva'}
              {step === 'ASSIGNING' && `Reserva ${currentItemIndex + 1} de ${selections.length}`}
              {step === 'INFO' && 'Datos de Contacto'}
            </h2>
            {step === 'ASSIGNING' && (
              <button 
                onClick={() => {
                  if (currentItemIndex > 0) {
                    setCurrentItemIndex(currentItemIndex - 1)
                  } else {
                    setStep('CART')
                  }
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 mt-1 uppercase tracking-widest"
              >
                ← Volver
              </button>
            )}
            {step === 'INFO' && (
              <button 
                onClick={() => setStep('ASSIGNING')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 mt-1 uppercase tracking-widest"
              >
                ← Volver a Reservas
              </button>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {step === 'CART' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {items.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <p className="font-bold text-slate-900">No hay servicios seleccionados.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="font-black text-slate-900 text-lg mb-1">
                            {item.name} {item.quantity > 1 && <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-lg ml-2 text-sm">x{item.quantity}</span>}
                          </p>
                          <p className="font-black text-xl leading-none" style={{ color: themeColor }}>${item.price * item.quantity}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">{(item.duration || 30) * item.quantity} min</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl mt-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-slate-400">Total a pagar</span>
                      <span className="font-black text-3xl">${totalPrice}</span>
                    </div>
                    <button 
                      onClick={startCheckout}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mb-3"
                    >
                      Asignar Horarios <ArrowRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleClose}
                      className="w-full py-3 border-2 border-slate-700 text-slate-300 hover:text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center"
                    >
                      + Agregar otro servicio
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'ASSIGNING' && currentSelection && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm">
                <h3 className="font-black text-lg text-slate-900 mb-1">{currentSelection.serviceName}</h3>
                <p className="text-sm font-bold text-slate-500">${currentSelection.price} • {currentSelection.duration} min</p>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 font-bold text-sm rounded-2xl border border-rose-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">1. ¿Para quién es este servicio?</label>
                <input 
                  type="text" 
                  value={currentSelection.customerName}
                  onChange={e => updateCurrentSelection({ customerName: e.target.value })}
                  placeholder="Nombre de la persona"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-purple-400 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">2. Elige {staffLabel}</label>
                <div className="grid grid-cols-2 gap-3">
                  {staff.map(member => {
                    const isSelected = currentSelection.staffId === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleStaffSelect(member.id)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${
                          isSelected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 bg-white text-slate-600 hover:border-purple-200'
                        }`}
                      >
                        <span className="font-black block truncate">{member.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {currentSelection.staffId && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">3. Elige Fecha</label>
                  <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 snap-x">
                    {days.map(d => {
                      const isSelected = currentSelection.date && isSameDay(currentSelection.date, d)
                      return (
                        <button
                          key={d.toISOString()}
                          onClick={() => handleDateSelect(d)}
                          className={`flex-shrink-0 w-20 p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all snap-start ${
                            isSelected 
                              ? 'bg-purple-500 border-purple-500 text-white' 
                              : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <span className="font-black text-xs uppercase mb-1 opacity-80">{format(d, 'eee', { locale: es })}</span>
                          <span className="font-black text-2xl">{format(d, 'd')}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentSelection.date && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">4. Elige Horario</label>
                  {isPending ? (
                    <div className="text-center py-6"><div className="w-6 h-6 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-6 bg-slate-100 rounded-2xl font-bold text-slate-500">No hay horarios.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(time => {
                        const isSelected = currentSelection.time === time;
                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`p-3 rounded-xl border-2 font-black transition-all ${
                              isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-slate-100 hover:border-purple-300 text-slate-700'
                            }`}
                          >
                            {time}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={nextItemOrInfo}
                className="w-full py-4 text-white rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
                style={{ backgroundColor: themeColor }}
              >
                {currentItemIndex < selections.length - 1 ? 'Siguiente Servicio' : 'Continuar'} <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          )}

          {step === 'INFO' && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 font-bold text-sm rounded-2xl border border-rose-200">
                  {error}
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-4">
                <p className="font-bold text-slate-500 text-sm mb-4">Ingresa tu número de WhatsApp para que podamos confirmar la reserva.</p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu WhatsApp de Contacto</label>
                  <input 
                    type="tel" 
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Ej: 351..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100 text-purple-900 space-y-4">
                <h4 className="font-black text-lg mb-2">Resumen Final</h4>
                
                <div className="space-y-3">
                  {selections.map((sel, idx) => {
                    const staffName = staff.find(s => s.id === sel.staffId)?.name
                    return (
                      <div key={idx} className="bg-white/60 p-3 rounded-xl border border-purple-100">
                        <p className="font-black text-sm">{sel.serviceName}</p>
                        <p className="text-xs font-bold text-slate-600 mt-1">Para: {sel.customerName}</p>
                        <p className="text-xs font-bold text-slate-600 mt-1">Con: {staffName}</p>
                        <p className="text-xs font-bold text-purple-700 mt-1">{format(sel.date!, 'dd/MM/yyyy')} a las {sel.time}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-between font-bold text-sm pt-4 border-t border-purple-200/50">
                  <span className="text-purple-600">Total a pagar</span>
                  <span className="font-black text-xl">${totalPrice}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-4 text-white rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                {isPending ? 'Procesando...' : 'Confirmar Todo'}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  )
}
