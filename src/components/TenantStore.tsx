'use client'

import { useCart } from './CartProvider'
import { Plus, X, Check } from 'lucide-react'
import { useState } from 'react'
import CartSidebar from './CartSidebar'

export default function TenantStore({ tenant, services, staff }: { tenant: any, services: any[], staff: any[] }) {
  const { addItem } = useCart()
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<number[]>([])

  const openVariantModal = (service: any) => {
    if (!service.variants || service.variants.length === 0) {
      // If no variants, add directly
      addItem(service)
      return
    }
    setSelectedService(service)
    setSelectedVariants([])
  }

  const toggleVariant = (index: number) => {
    if (selectedVariants.includes(index)) {
      setSelectedVariants(selectedVariants.filter(i => i !== index))
    } else {
      setSelectedVariants([...selectedVariants, index])
    }
  }

  const handleAddWithVariants = () => {
    if (!selectedService) return
    
    // Calculate final price and duration based on selected variants
    let finalPrice = selectedService.price
    let finalDuration = selectedService.duration_minutes
    let finalName = selectedService.name

    if (selectedVariants.length > 0) {
      const variantNames: string[] = []
      selectedVariants.forEach(idx => {
        const v = selectedService.variants[idx]
        finalPrice += v.extra_price
        finalDuration += v.extra_duration
        variantNames.push(v.name)
      })
      finalName += ` (+${variantNames.join(', ')})`
    }

    // Add modified service to cart
    addItem({
      ...selectedService,
      id: `${selectedService.id}-${selectedVariants.join('-')}`, // unique cart ID
      name: finalName,
      price: finalPrice,
      duration_minutes: finalDuration
    })

    setSelectedService(null)
  }

  const themeColor = tenant.theme_color || '#8b5cf6'
  const serviceLabel = tenant.service_label || 'Servicio'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 font-sans pb-32">
      {/* Header Fijo */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt="Logo" className="w-12 h-12 rounded-2xl object-cover shadow-lg" />
            ) : (
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white"
                style={{ backgroundColor: themeColor }}
              >
                <span className="text-2xl font-black">{tenant.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="font-black text-slate-900 text-xl leading-none tracking-tight">{tenant.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1 block">Reservas Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {tenant.welcome_message && (
          <div className="mb-12 bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-xl text-center">
            <p className="text-lg font-bold text-slate-700">{tenant.welcome_message}</p>
          </div>
        )}

        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Nuestro Catálogo</h2>
          <p className="text-sm font-bold text-slate-500">Selecciona los {serviceLabel.toLowerCase()}s que deseas reservar.</p>
        </div>

        {/* CSS Grid para Servicios */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white/60 backdrop-blur-md border border-white rounded-[2.5rem] shadow-xl">
              <p className="text-sm font-bold text-slate-500">Próximamente agregaremos nuestros {serviceLabel.toLowerCase()}s.</p>
            </div>
          ) : (
            services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 flex flex-col h-full justify-between gap-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div>
                  {service.image_url && (
                    <img src={service.image_url} alt={service.name} className="w-full h-48 object-cover rounded-xl mb-4" />
                  )}
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{service.name}</h3>
                  <p className="text-3xl font-black mt-3" style={{ color: themeColor }}>
                    ${service.price}
                  </p>
                  {service.variants && service.variants.length > 0 && (
                    <p className="text-xs font-bold text-slate-400 mt-2">
                      + {service.variants.length} variantes disponibles
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => openVariantModal(service)}
                  className="w-full py-4 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="w-5 h-5" />
                  Agregar al turno
                </button>
              </div>
            ))
          )}
        </div>

        {/* Redes Sociales y Mapa */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {(tenant.instagram_url || tenant.tiktok_url || tenant.whatsapp_url) && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl flex flex-col justify-center">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Síguenos en Redes</h3>
              <div className="flex flex-wrap gap-4">
                {tenant.instagram_url && (
                  <a href={tenant.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-orange-400 to-pink-500 text-white font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                    Instagram
                  </a>
                )}
                {tenant.tiktok_url && (
                  <a href={tenant.tiktok_url} target="_blank" rel="noopener noreferrer" className="bg-black text-white font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                    TikTok
                  </a>
                )}
                {tenant.whatsapp_url && (
                  <a href={tenant.whatsapp_url} target="_blank" rel="noopener noreferrer" className="bg-emerald-500 text-white font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}

          {tenant.address_map_url && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-2xl font-black text-slate-900 mb-6">¿Dónde estamos?</h3>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100">
                <iframe 
                  src={tenant.address_map_url} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Variant Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedService(null)}></div>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedService(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedService.name}</h3>
            <p className="text-slate-500 font-bold text-sm mb-6">Selecciona los adicionales que desees sumar a tu {serviceLabel.toLowerCase()}.</p>
            
            <div className="space-y-3 mb-8">
              {selectedService.variants.map((v: any, idx: number) => {
                const isSelected = selectedVariants.includes(idx)
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleVariant(idx)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className={`font-bold ${isSelected ? 'text-purple-900' : 'text-slate-700'}`}>{v.name}</p>
                      <p className={`text-xs font-bold ${isSelected ? 'text-purple-600' : 'text-slate-400'}`}>+{v.extra_duration} min</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${isSelected ? 'text-purple-600' : 'text-slate-900'}`}>+${v.extra_price}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleAddWithVariants}
              className="w-full py-4 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              style={{ backgroundColor: themeColor }}
            >
              Confirmar Agregar
            </button>
          </div>
        </div>
      )}

      <CartSidebar 
        tenantId={tenant.id} 
        tenantName={tenant.name} 
        whatsappNumber={tenant.whatsapp_number} 
        staff={staff}
        themeColor={themeColor}
        staffLabel={tenant.staff_label || 'Profesional'}
      />
    </div>
  )
}
