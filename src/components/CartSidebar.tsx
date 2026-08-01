'use client'

import { useCart } from './CartProvider'
import { useState, useTransition } from 'react'
import { X, Calendar, Clock, User, Trash2, ArrowRight } from 'lucide-react'
import { addDays, format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAvailableSlots, createBooking } from '@/app/[tenant_slug]/booking-actions'

type CheckoutStep = 'CART' | 'STAFF' | 'DATE' | 'TIME' | 'INFO'

export default function CartSidebar({ tenantId, tenantName, whatsappNumber, staff, themeColor }: { tenantId: string, tenantName: string, whatsappNumber: string, staff: any[], themeColor: string }) {
  const { items, isOpen, setIsOpen, removeItem, clearCart } = useCart()
  const [step, setStep] = useState<CheckoutStep>('CART')
  
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')

  const totalDuration = items.reduce((acc, item) => acc + (item.duration || 30), 0)
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  if (items.length === 0 && !isOpen) return null

  const resetFlow = () => {
    setStep('CART')
    setSelectedStaff(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setError('')
  }

  const handleClose = () => {
    setIsOpen(false)
    if (items.length === 0) resetFlow()
  }

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId)
    setStep('DATE')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dateString = format(date, 'yyyy-MM-dd')
    
    startTransition(async () => {
      if (!selectedStaff) return
      const slots = await getAvailableSlots(tenantId, dateString, totalDuration, selectedStaff)
      setAvailableSlots(slots)
      setStep('TIME')
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !selectedStaff) return

    startTransition(async () => {
      const result = await createBooking({
        tenantId,
        staffId: selectedStaff,
        customerName,
        customerPhone,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        totalPrice,
        totalDuration,
        services: items
      })

      if (result.error) {
        setError(result.error)
      } else {
        // Enviar a WhatsApp
        const staffName = staff.find(s => s.id === selectedStaff)?.name
        const dateStr = format(selectedDate, 'dd/MM/yyyy')
        let msg = `Hola! Soy ${customerName}. Quiero reservar un turno en ${tenantName} con ${staffName}:\n\n`
        items.forEach(item => {
          msg += `- ${item.name} ($${item.price})\n`
        })
        msg += `\n📅 Fecha: ${dateStr}\n🕒 Hora: ${selectedTime}\n💰 Total: $${totalPrice}\n\nMi teléfono es: ${customerPhone}`
        
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
        
        clearCart()
        setIsOpen(false)
        resetFlow()
      }
    })
  }

  // Generate next 14 days
  const days = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i))

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
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col border-l border-slate-100 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
              {step === 'CART' && 'Tu Reserva'}
              {step === 'STAFF' && 'Elige Profesional'}
              {step === 'DATE' && 'Elige Fecha'}
              {step === 'TIME' && 'Elige Horario'}
              {step === 'INFO' && 'Tus Datos'}
            </h2>
            {step !== 'CART' && (
              <button 
                onClick={() => setStep(step === 'INFO' ? 'TIME' : step === 'TIME' ? 'DATE' : step === 'DATE' ? 'STAFF' : 'CART')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 mt-1 uppercase tracking-widest"
              >
                ← Volver
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
                          <p className="font-black text-slate-900 text-lg mb-1">{item.name}</p>
                          <p className="font-black text-xl leading-none" style={{ color: themeColor }}>${item.price}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">{item.duration || 30} min</p>
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
                      <span className="font-bold text-slate-400">Total</span>
                      <span className="font-black text-3xl">${totalPrice}</span>
                    </div>
                    <button 
                      onClick={() => setStep('STAFF')}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      Elegir Profesional <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'STAFF' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {staff.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-bold text-slate-500">No hay profesionales disponibles.</p>
                </div>
              ) : (
                staff.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleStaffSelect(member.id)}
                    className="w-full bg-white border-2 border-slate-100 hover:border-purple-200 rounded-2xl p-4 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">{member.name}</span>
                    </div>
                    <User className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                  </button>
                ))
              )}
            </div>
          )}

          {step === 'DATE' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              {days.map(d => {
                const isSelected = selectedDate && isSameDay(selectedDate, d)
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => handleDateSelect(d)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'bg-purple-50 border-purple-500' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {format(d, 'd')}
                      </div>
                      <div className="text-left">
                        <p className={`font-black uppercase text-sm ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                          {format(d, 'EEEE', { locale: es })}
                        </p>
                        <p className={`font-bold text-xs ${isSelected ? 'text-purple-600' : 'text-slate-400'}`}>
                          {format(d, 'MMMM', { locale: es })}
                        </p>
                      </div>
                    </div>
                    {isSelected && isPending && <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />}
                  </button>
                )
              })}
            </div>
          )}

          {step === 'TIME' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-900 text-white p-4 rounded-2xl mb-6 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="font-bold">{selectedDate ? format(selectedDate, 'EEEE d de MMMM', { locale: es }) : ''}</span>
              </div>
              
              {availableSlots.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-slate-100 rounded-3xl">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No hay horarios disponibles<br/>para este día.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time)
                        setStep('INFO')
                      }}
                      className="bg-white border-2 border-slate-100 hover:border-purple-400 hover:bg-purple-50 p-4 rounded-2xl font-black text-slate-700 hover:text-purple-700 transition-all text-lg shadow-sm"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
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
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100 text-purple-900 space-y-2">
                <h4 className="font-black text-lg mb-4">Resumen</h4>
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-purple-600">Fecha</span>
                  <span>{selectedDate && format(selectedDate, 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-purple-600">Hora</span>
                  <span>{selectedTime}</span>
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
                {isPending ? 'Procesando...' : 'Confirmar Turno'}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  )
}
