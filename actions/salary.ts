// @ts-nocheck
// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSalary(employeeId?: string) {
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
    .from('salary_structures')
    .select('*')
    .eq('employee_id', queryId)
    .single()
    
  if (error) return { error: error.message }
  return { salary: data }
}

export async function updateSalary(employeeId: string, formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: adminProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Not authorized. Only admins can update salary.' }
  }
  
  const updates = {
    monthly_wage: Number(formData.get('monthlyWage')) || 0,
    basic: Number(formData.get('basic')) || 0,
    hra: Number(formData.get('hra')) || 0,
    standard_allowance: Number(formData.get('standardAllowance')) || 0,
    performance_bonus: Number(formData.get('performanceBonus')) || 0,
    travel_allowance: Number(formData.get('travelAllowance')) || 0,
    fixed_allowance: Number(formData.get('fixedAllowance')) || 0,
    pf_rate: Number(formData.get('pfRate')) || 12,
    professional_tax: Number(formData.get('professionalTax')) || 200,
    updated_at: new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('salary_structures')
    .update(updates)
    .eq('employee_id', employeeId)
    
  if (error) return { error: error.message }
  
  revalidatePath('/salary')
  return { success: true }
}
