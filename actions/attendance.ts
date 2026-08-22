'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkIn() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: employee } = await supabase
    .from('employees')
    .select('id, company_id')
    .eq('user_id', user.id)
    .single() as { data: any, error: any }
    
  if (!employee) return { error: 'Employee not found' }
  
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()
  
  // Check if already checked in
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .single() as { data: any, error: any }
    
  if (existing) {
    return { error: 'Already checked in for today' }
  }
  
  const { error } = await supabase
    .from('attendance')
    .insert({
      employee_id: employee.id,
      company_id: employee.company_id,
      date: today,
      check_in: now,
      status: 'present'
    } as any)
    
  if (error) return { error: error.message }
  
  revalidatePath('/attendance')
  return { success: true }
}

export async function checkOut() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: any, error: any }
    
  if (!employee) return { error: 'Employee not found' }
  
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()
  
  // Get today's attendance
  const { data: existing, error: fetchError } = await supabase
    .from('attendance')
    .select('id, check_in, check_out')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .single() as { data: any, error: any }
    
  if (fetchError || !existing) {
    return { error: 'No check-in found for today' }
  }
  
  if (existing.check_out) {
    return { error: 'Already checked out for today' }
  }
  
  if (!existing.check_in) {
    return { error: 'Invalid check-in data' }
  }
  
  // Calculate work hours
  const checkInTime = new Date(existing.check_in)
  const checkOutTime = new Date(now)
  const hoursDiff = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
  const workHours = Math.round(hoursDiff * 100) / 100 // round to 2 decimal places
  
  // Assuming 8 hours is standard
  const extraHours = workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0
  
  const { error } = await supabase
    .from('attendance')
    .update({
      check_out: now,
      work_hours: workHours,
      extra_hours: extraHours
    } as any)
    .eq('id', existing.id)
    
  if (error) return { error: error.message }
  
  revalidatePath('/attendance')
  return { success: true }
}

export async function getEmployeeAttendance(employeeId?: string, month?: number, year?: number) {
  const supabase = createClient()
  
  // If no employeeId provided, get current employee's attendance
  let queryId = employeeId
  if (!queryId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single() as { data: any, error: any }
      
    if (!employee) return { error: 'Employee not found' }
    queryId = employee.id
  }
  
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', queryId)
    .order('date', { ascending: false })
    
  // Simple month filtering if provided (assuming YYYY-MM format)
  if (month && year) {
    const startStr = `${year}-${month.toString().padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const endStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`
    
    query = query.gte('date', startStr).lt('date', endStr)
  }
    
  const { data, error } = await query
  
  if (error) return { error: error.message }
  return { attendance: data }
}

export async function getTodayAttendance() {
  const supabase = createClient()
  
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('attendance')
    .select('*, employees(full_name, department, job_title)')
    .eq('date', today)
    .order('check_in', { ascending: false })
    
  if (error) return { error: error.message }
  return { attendance: data }
}
