'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addServiceAction(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const durationMinutes = parseInt(formData.get('duration_minutes') as string, 10)
  const tenantId = formData.get('tenant_id') as string

  if (!name || isNaN(price) || isNaN(durationMinutes) || !tenantId) {
    return { error: 'Datos inválidos.' }
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.from('services').insert({
    tenant_id: tenantId,
    name,
    price,
    duration_minutes: durationMinutes,
  })

  if (error) {
    console.error('Error insertando servicio:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteServiceAction(formData: FormData) {
  const id = formData.get('id') as string
  const tenantId = formData.get('tenant_id') as string

  if (!id || !tenantId) return { error: 'ID inválido.' }

  const supabase = await createClient()
  
  const { error } = await supabase.from('services').delete().eq('id', id).eq('tenant_id', tenantId)

  if (error) {
    console.error('Error borrando servicio:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
