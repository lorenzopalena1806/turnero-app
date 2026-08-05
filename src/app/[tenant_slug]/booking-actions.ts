'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { parseISO, addMinutes, format, startOfDay, endOfDay } from 'date-fns'

export async function getAvailableSlots(tenantId: string, dateString: string, durationMinutes: number, staffId: string) {
  const adminAuthClient = createAdminClient()
  
  const date = parseISO(dateString)
  const dayOfWeek = date.getDay()

  const { data: schedule } = await adminAuthClient
    .from('staff_schedules')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!schedule || !schedule.is_working) {
    return [] // Empleado no trabaja ese día
  }

  // Generate slots for a shift
  const generateSlotsForShift = (open: string, close: string) => {
    const [openHour, openMinute] = open.split(':').map(Number)
    const [closeHour, closeMinute] = close.split(':').map(Number)
    
    let currentTime = new Date(date)
    currentTime.setHours(openHour, openMinute, 0, 0)
    
    const endTime = new Date(date)
    endTime.setHours(closeHour, closeMinute, 0, 0)

    const shiftSlots = []
    while (currentTime < endTime) {
      const slotEnd = addMinutes(currentTime, durationMinutes)
      if (slotEnd <= endTime) {
        shiftSlots.push(format(currentTime, 'HH:mm'))
      }
      currentTime = addMinutes(currentTime, 15)
    }
    return shiftSlots
  }

  let slots: string[] = []
  if (schedule.open_time && schedule.close_time) {
    slots = slots.concat(generateSlotsForShift(schedule.open_time, schedule.close_time))
  }
  if (schedule.open_time_2 && schedule.close_time_2) {
    slots = slots.concat(generateSlotsForShift(schedule.open_time_2, schedule.close_time_2))
  }

  // Get existing appointments
  const startOfDayUtc = startOfDay(date).toISOString()
  const endOfDayUtc = endOfDay(date).toISOString()

  const { data: appointments } = await adminAuthClient
    .from('appointments')
    .select('start_time, end_time')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staffId)
    .neq('status', 'cancelled')
    .gte('start_time', startOfDayUtc)
    .lte('start_time', endOfDayUtc)

  // Get blocked slots
  const { data: blocks } = await adminAuthClient
    .from('blocked_slots')
    .select('start_time, end_time')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staffId)
    .gte('start_time', startOfDayUtc)
    .lte('start_time', endOfDayUtc)

  const allOccupied = [...(appointments || []), ...(blocks || [])]

  // Filter overlapping slots
  const availableSlots = slots.filter(slot => {
    const slotStart = new Date(`${dateString}T${slot}:00`)
    const slotEnd = addMinutes(slotStart, durationMinutes)

    const isOverlapping = allOccupied.some(occ => {
      const occStart = parseISO(occ.start_time)
      const occEnd = parseISO(occ.end_time)
      return (slotStart < occEnd && slotEnd > occStart)
    })

    return !isOverlapping
  })

  return availableSlots
}

export async function createBooking(data: {
  tenantId: string,
  staffId: string,
  customerName: string,
  customerPhone: string,
  date: string,
  time: string,
  totalPrice: number,
  totalDuration: number,
  services: any[]
}) {
  const supabase = await createClient()

  // 1. Double check availability to prevent overbooking
  const availableSlots = await getAvailableSlots(data.tenantId, data.date, data.totalDuration, data.staffId)
  if (!availableSlots.includes(data.time)) {
    return { error: 'Lo sentimos, este horario acaba de ser reservado por alguien más.' }
  }

  const startDateTime = new Date(`${data.date}T${data.time}:00`)
  const endDateTime = addMinutes(startDateTime, data.totalDuration)

  // 2. Insert appointment
  const { error } = await supabase
    .from('appointments')
    .insert({
      tenant_id: data.tenantId,
      staff_id: data.staffId,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'pending',
      total_price: data.totalPrice,
      services: data.services
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function createMultipleBookings(bookings: Array<{
  tenantId: string,
  staffId: string,
  customerName: string,
  customerPhone: string,
  date: string,
  time: string,
  totalPrice: number,
  totalDuration: number,
  services: any[]
}>) {
  const supabase = await createClient()

  // 1. Check availability for ALL bookings first
  for (const booking of bookings) {
    const availableSlots = await getAvailableSlots(booking.tenantId, booking.date, booking.totalDuration, booking.staffId)
    if (!availableSlots.includes(booking.time)) {
      return { error: `El horario ${booking.time} para el servicio de ${booking.customerName} ya no está disponible.` }
    }
  }

  // 2. Prepare payload for multiple insertions
  const payload = bookings.map(b => {
    const startDateTime = new Date(`${b.date}T${b.time}:00`)
    const endDateTime = addMinutes(startDateTime, b.totalDuration)
    return {
      tenant_id: b.tenantId,
      staff_id: b.staffId,
      customer_name: b.customerName,
      customer_phone: b.customerPhone,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'pending',
      total_price: b.totalPrice,
      services: b.services
    }
  })

  // 3. Insert all appointments
  const { error } = await supabase
    .from('appointments')
    .insert(payload)

  if (error) return { error: error.message }
  return { success: true }
}
