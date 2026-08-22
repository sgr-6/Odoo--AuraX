// @ts-nocheck
// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export async function getLeaveBalances(employeeId?: string) {
  const supabase = createClient()
  
  let queryId = employeeId
  if (!queryId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single()
      
    if (!employee) return { error: 'Employee not found' }
    queryId = employee.id
  }
  
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', queryId)
    
  if (error) return { error: error.message }
  return { balances: data }
}

export async function createLeaveRequest(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: employee } = await supabase
    .from('employees')
    .select('id, company_id')
    .eq('user_id', user.id)
    .single()
    
  if (!employee) return { error: 'Employee not found' }
  
  const leaveType = formData.get('leaveType') as 'paid' | 'sick' | 'unpaid'
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const remarks = formData.get('remarks') as string
  
  if (!leaveType || !startDate || !endDate) {
    return { error: 'Missing required fields' }
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    return { error: 'Start date must be before or equal to end date' }
  }
  
  // Calculate requested days (rough estimate without considering weekends/holidays)
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  // Check balance if not unpaid
  if (leaveType !== 'unpaid') {
    const { data: balance, error: balanceError } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('leave_type', leaveType)
      .single()
      
    if (balanceError || !balance) {
      return { error: 'Leave balance not found' }
    }
    
    const remainingDays = balance.allocated_days - balance.used_days
    if (days > remainingDays) {
      return { error: `Insufficient leave balance. You have ${remainingDays} days remaining.` }
    }
  }
  
  let attachmentUrl = null
  const file = formData.get('attachment') as File | null
  
  if (leaveType === 'sick' && !file) {
    return { error: 'Sick leave requires an attachment' }
  }
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${employee.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('leave-attachments')
      .upload(fileName, file)
      
    if (uploadError) return { error: 'Failed to upload attachment' }
    attachmentUrl = uploadData.path
  }
  
  const { error } = await supabase
    .from('leave_requests')
    .insert({
      employee_id: employee.id,
      company_id: employee.company_id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      remarks,
      attachment_url: attachmentUrl,
      status: 'pending'
    })
    
  if (error) return { error: error.message }
  
  revalidatePath('/leave')
  return { success: true }
}

export async function getLeaveRequests(employeeId?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('leave_requests')
    .select('*, employees(full_name, department)')
    .order('created_at', { ascending: false })
    
  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  
  const { data, error } = await query
  
  if (error) return { error: error.message }
  return { requests: data }
}

export async function approveLeave(requestId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // Get request to find employee and dates
  const { data: request, error: requestError } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('id', requestId)
    .single()
    
  if (requestError || !request) return { error: 'Request not found' }
  
  if (request.status === 'approved') return { error: 'Already approved' }
  
  // Update request
  const { error } = await supabase
    .from('leave_requests')
    .update({
      status: 'approved',
      reviewed_by: user.id
    })
    .eq('id', requestId)
    
  if (error) return { error: error.message }
  
  // Calculate days
  const start = new Date(request.start_date)
  const end = new Date(request.end_date)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  // Update balance if not unpaid
  if (request.leave_type !== 'unpaid') {
    // We need to fetch current used_days first or use an RPC. Using RPC is safer, but we can do a read-write here.
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('id, used_days')
      .eq('employee_id', request.employee_id)
      .eq('leave_type', request.leave_type)
      .single()
      
    if (balance) {
      await supabase
        .from('leave_balances')
        .update({ used_days: Number(balance.used_days) + days })
        .eq('id', balance.id)
    }
  }
  
  revalidatePath('/leave')
  return { success: true }
}

export async function rejectLeave(requestId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: request, error: requestError } = await supabase
    .from('leave_requests')
    .select('status, leave_type, employee_id, start_date, end_date')
    .eq('id', requestId)
    .single()
    
  if (requestError || !request) return { error: 'Request not found' }
  
  // If it was already approved, we need to revert the balance
  if (request.status === 'approved' && request.leave_type !== 'unpaid') {
    const start = new Date(request.start_date)
    const end = new Date(request.end_date)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('id, used_days')
      .eq('employee_id', request.employee_id)
      .eq('leave_type', request.leave_type)
      .single()
      
    if (balance) {
      await supabase
        .from('leave_balances')
        .update({ used_days: Math.max(0, Number(balance.used_days) - days) })
        .eq('id', balance.id)
    }
  }
  
  const { error } = await supabase
    .from('leave_requests')
    .update({
      status: 'rejected',
      reviewed_by: user.id
    })
    .eq('id', requestId)
    
  if (error) return { error: error.message }
  
  revalidatePath('/leave')
  return { success: true }
}
