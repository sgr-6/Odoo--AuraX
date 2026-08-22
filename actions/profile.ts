// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEmployeeProfile(employeeId?: string) {
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
    .from('employees')
    .select('*, users!inner(email, role, login_id)')
    .eq('id', queryId)
    .single()
    
  if (error) return { error: error.message }
  return { profile: data }
}

export async function updateEmployeeProfile(employeeId: string, formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // Verify authorization
  const { data: profileUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  const isAdmin = profileUser?.role === 'admin'
  
  // If not admin, verify they are updating their own profile
  if (!isAdmin) {
    const { data: myEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single()
      
    if (!myEmployee || myEmployee.id !== employeeId) {
      return { error: 'Not authorized to update this profile' }
    }
  }
  
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  let avatarUrl = formData.get('avatarUrl') as string
  
  const file = formData.get('avatar') as File | null
  
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${employeeId}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
      
    if (uploadError) return { error: 'Failed to upload avatar' }
    avatarUrl = uploadData.path
  }
  
  const updates: any = {
    phone: phone || null,
    address: address || null,
  }
  
  if (avatarUrl) {
    updates.avatar_url = avatarUrl
  }
  
  // Admins can update additional fields
  if (isAdmin) {
    const fullName = formData.get('fullName') as string
    const jobTitle = formData.get('jobTitle') as string
    const department = formData.get('department') as string
    
    if (fullName) updates.full_name = fullName
    if (jobTitle) updates.job_title = jobTitle
    if (department) updates.department = department
  }
  
  const { error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', employeeId)
    
  if (error) return { error: error.message }
  
  revalidatePath('/profile')
  return { success: true }
}
