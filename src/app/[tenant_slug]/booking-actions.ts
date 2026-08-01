'use server'

import { createClient } from '@/utils/supabase/server'
import { parseISO, addMinutes, format, isBefore, isEqual, isAfter, startOfDay, endOfDay } from 'date-fns'

export async function getAvailableSlots(tenantId: string, dateString: string, totalDuration: number) {
  const supabase = await createClient()
  
  // Parse date and get day of week (0 = Sunday, 1 = Monday)
  const date = parseISO(dateString)
  const dayOfWeek = date.getDay()

  // 1. Fetch business hours for this day
  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!hours || hours.is_closed) return []

  // 2. Fetch existing appointments for this day
  const start = startOfDay(date).toISOString()
  const end = endOfDay(date).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('tenant_id', tenantId)
    .neq('status', 'cancelled')
    .gte('start_time', start)
    .lte('start_time', end)

  // 3. Generate slots
  const [openHour, openMinute] = hours.open_time.split(':').map(Number)
  const [closeHour, closeMinute] = hours.close_time.split(':').map(Number)

  let currentTime = new Date(date)
  currentTime.setHours(openHour, openMinute, 0, 0)
  
  const closeTime = new Date(date)
  closeTime.setHours(closeHour, closeMinute, 0, 0)

  const slots = []

  while (isBefore(currentTime, closeTime)) {
    const potentialEndTime = addMinutes(currentTime, totalDuration)

    if (isAfter(potentialEndTime, closeTime)) {
      break
    }

    // Check overlap with existing appointments
    let hasOverlap = false
    if (appointments) {
      for (const appt of appointments) {
        const apptStart = new Date(appt.start_time)
        const apptEnd = new Date(appt.end_time)

        // Overlap condition: start < end AND end > start
        if (isBefore(currentTime, apptEnd) && isAfter(potentialEndTime, apptStart)) {
          hasOverlap = true
          break
        }
      }
    }

    if (!hasOverlap) {
      slots.push(format(currentTime, 'HH:mm'))
    }

    // Advance by 30 minutes blocks (or whatever granularity is preferred)
    currentTime = addMinutes(currentTime, 30)
  }

  return slots
}

export async function createBooking(data: {
  tenantId: string
  customerName: string
  customerPhone: string
  date: string
  time: string
  totalDuration: number
  totalPrice: number
  services: any[]
}) {
  const supabase = await createClient()

  const startDateTime = new Date(`${data.date}T${data.time}:00`)
  const endDateTime = addMinutes(startDateTime, data.totalDuration)

  // Double check overlap on the server
  const { data: overlapping } = await supabase
    .from('appointments')
    .select('id')
    .eq('tenant_id', data.tenantId)
    .neq('status', 'cancelled')
    .lt('start_time', endDateTime.toISOString())
    .gt('end_time', startDateTime.toISOString())

  if (overlapping && overlapping.length > 0) {
    return { error: 'El horario seleccionado ya no está disponible.' }
  }

  const { data: newAppt, error } = await supabase
    .from('appointments')
    .insert({
      tenant_id: data.tenantId,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      total_price: data.totalPrice,
      services: data.services
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    return { error: error.message }
  }

  return { success: true, appointmentId: newAppt.id }
}
