'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createTenant(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const whatsapp = formData.get('whatsapp') as string

    if (!email || !password || !name || !slug || !whatsapp) {
      return { error: 'Todos los campos son obligatorios.' }
    }

    const adminAuthClient = createAdminClient()

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm
    })

    if (authError) {
      return { error: `Error creando usuario: ${authError.message}` }
    }

    const userId = authData.user.id

    // 2. Create the tenant record
    const { error: dbError } = await adminAuthClient
      .from('tenants')
      .insert({
        owner_id: userId,
        name: name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        whatsapp_number: whatsapp,
      })

    if (dbError) {
      // If db fails, ideally we should delete the user to keep things clean
      await adminAuthClient.auth.admin.deleteUser(userId)
      return { error: `Error creando registro del comercio: ${dbError.message}` }
    }

    revalidatePath('/admin')
    return { success: `Comercio ${name} aprovisionado correctamente.` }
  } catch (error: any) {
    return { error: `Error inesperado: ${error.message}` }
  }
}

export async function toggleTenantStatusAction(tenantId: string, currentStatus: boolean) {
  try {
    const adminAuthClient = createAdminClient()
    const { error } = await adminAuthClient
      .from('tenants')
      .update({ is_active: !currentStatus })
      .eq('id', tenantId)

    if (error) return { error: `Error cambiando estado: ${error.message}` }
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { error: `Error inesperado: ${error.message}` }
  }
}

export async function deleteTenantAction(tenantId: string, ownerId: string) {
  try {
    const adminAuthClient = createAdminClient()
    
    // 1. Delete tenant record
    const { error: dbError } = await adminAuthClient
      .from('tenants')
      .delete()
      .eq('id', tenantId)

    if (dbError) return { error: `Error borrando comercio: ${dbError.message}` }

    // 2. Delete user from auth so they can't log in anymore
    if (ownerId) {
      await adminAuthClient.auth.admin.deleteUser(ownerId)
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { error: `Error inesperado: ${error.message}` }
  }
}
