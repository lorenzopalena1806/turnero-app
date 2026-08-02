'use client'

import { useState, useTransition } from 'react'
import { Save } from 'lucide-react'
import { updateTenantSettingsAction } from '@/app/(dashboard)/dashboard/settings/actions'
import { toast } from 'sonner'

export default function TenantSettingsForm({ 
  tenant 
}: { 
  tenant: any 
}) {
  const [isPending, startTransition] = useTransition()
  
  const [staffLabel, setStaffLabel] = useState(tenant.staff_label || 'Profesional')
  const [serviceLabel, setServiceLabel] = useState(tenant.service_label || 'Servicio')
  const [themeColor, setThemeColor] = useState(tenant.theme_color || '#8b5cf6')
  const [welcomeMessage, setWelcomeMessage] = useState(tenant.welcome_message || '')
  
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '')
  const [instagramUrl, setInstagramUrl] = useState(tenant.instagram_url || '')
  const [tiktokUrl, setTiktokUrl] = useState(tenant.tiktok_url || '')
  const [whatsappUrl, setWhatsappUrl] = useState(tenant.whatsapp_url || '')
  const [addressMapUrl, setAddressMapUrl] = useState(tenant.address_map_url || '')
  const [requirePaymentMethod, setRequirePaymentMethod] = useState(tenant.require_payment_method ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await updateTenantSettingsAction(tenant.id, {
        staff_label: staffLabel,
        service_label: serviceLabel,
        theme_color: themeColor,
        welcome_message: welcomeMessage,
        logo_url: logoUrl,
        instagram_url: instagramUrl,
        tiktok_url: tiktokUrl,
        whatsapp_url: whatsappUrl,
        address_map_url: addressMapUrl,
        require_payment_method: requirePaymentMethod
      })
      toast.success('Configuración guardada exitosamente')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 mb-8">
      <h3 className="text-xl font-black text-indigo-950 mb-6">Personalización de Tienda</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">URL de tu Logo</label>
          <input 
            type="text" 
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="Ej: https://misitio.com/logo.png"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Color Principal (Tienda)</label>
          <div className="flex gap-4 items-center h-full">
            <input 
              type="color" 
              value={themeColor}
              onChange={e => setThemeColor(e.target.value)}
              className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0 p-0"
            />
            <span className="font-bold text-indigo-950">{themeColor}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">¿Cómo llamas a tu personal?</label>
          <input 
            type="text" 
            value={staffLabel}
            onChange={e => setStaffLabel(e.target.value)}
            placeholder="Ej: Profesional, Doctor, Barbero"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">¿Cómo llamas a lo que ofreces?</label>
          <input 
            type="text" 
            value={serviceLabel}
            onChange={e => setServiceLabel(e.target.value)}
            placeholder="Ej: Servicio, Consulta, Alquiler"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Mensaje de Bienvenida</label>
          <input 
            type="text" 
            value={welcomeMessage}
            onChange={e => setWelcomeMessage(e.target.value)}
            placeholder="Ej: ¡Bienvenidos a nuestro local!"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Instagram</label>
          <input 
            type="text" 
            value={instagramUrl}
            onChange={e => setInstagramUrl(e.target.value)}
            placeholder="Ej: https://instagram.com/tu_cuenta"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">TikTok</label>
          <input 
            type="text" 
            value={tiktokUrl}
            onChange={e => setTiktokUrl(e.target.value)}
            placeholder="Ej: https://tiktok.com/@tu_cuenta"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">WhatsApp de Contacto (URL wa.me)</label>
          <input 
            type="text" 
            value={whatsappUrl}
            onChange={e => setWhatsappUrl(e.target.value)}
            placeholder="Ej: https://wa.me/5491122334455"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-2 ml-1">Google Maps (URL para Embeber)</label>
          <input 
            type="text" 
            value={addressMapUrl}
            onChange={e => setAddressMapUrl(e.target.value)}
            placeholder="Pega el 'src' del iframe de Google Maps"
            className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl px-5 py-4 text-indigo-950 focus:outline-none focus:border-purple-400 font-bold text-sm"
          />
        </div>
      </div>

      <div className="border-t border-indigo-50 pt-8 mb-8">
        <h3 className="text-xl font-black text-indigo-950 mb-6">Funciones Avanzadas</h3>
        
        <label className="flex items-center gap-4 cursor-pointer p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 w-fit">
          <input 
            type="checkbox" 
            checked={requirePaymentMethod}
            onChange={e => setRequirePaymentMethod(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <div>
            <span className="block font-bold text-indigo-950 text-sm">Registro de Medio de Pago</span>
            <span className="block font-bold text-indigo-900/50 text-xs">Preguntar si pagaron en efectivo o transferencia al completar el turno.</span>
          </div>
        </label>
      </div>

      <div className="flex justify-end border-t border-indigo-50 pt-6">
        <button 
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> Guardar Configuración
        </button>
      </div>
    </form>
  )
}
