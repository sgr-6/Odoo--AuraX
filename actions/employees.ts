'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10)
}

export async function createEmployee(formData: FormData) {
  const supabase = createClient()
  
  // Verify admin and get company ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: adminProfile } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()
    
  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Not authorized' }
  }
  
  const companyId = adminProfile.company_id
  
  // Get Company Name for ID generation
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .single()
    
  if (!company) return { error: 'Company not found' }
  
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const jobTitle = formData.get('jobTitle') as string
  const department = formData.get('department') as string
  const dateOfJoining = formData.get('dateOfJoining') as string
  
  if (!fullName || !email || !dateOfJoining) {
    return { error: 'Missing required fields' }
  }
  
  // Generate Login ID
  // Format: [Company Initials][First Name 2 letters + Last Name 2 letters][Year of Joining][4-digit Serial Number]
  const compWords = company.name.trim().split(/\s+/);
  let compPrefix = '';
  if (compWords.length > 1) {
    compPrefix = compWords.map((w: string) => w[0]).join('').substring(0, 3).toUpperCase();
  } else {
    compPrefix = company.name.substring(0, 2).toUpperCase().padEnd(2, 'X');
  }
  
  const nameParts = fullName.trim().split(/\s+/);
  const first = nameParts[0].substring(0, 2).toUpperCase().padEnd(2, 'X');
  const last = (nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0]).substring(0, 2).toUpperCase().padEnd(2, 'X');
  const year = new Date(dateOfJoining).getFullYear();
  
  const { count } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
    
  const seq = ((count || 0) + 1).toString().padStart(4, '0');
  const loginId = `${compPrefix}${first}${last}${year}${seq}`;
  const tempPassword = generateTempPassword();
  
  // Use admin client to create user so we don't log out the admin
  const adminAuthClient = createAdminClient()
  
  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true
  })
  
  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create auth user' }
  }
  
  const newUserId = authData.user.id
  
  // Create profile records (we can do this with regular client since RLS allows admin to insert)
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: newUserId,
      company_id: companyId,
      login_id: loginId,
      email: email,
      role: 'employee',
      must_change_password: true
    })
    
  if (userError) {
    // Cleanup on fail
    await adminAuthClient.auth.admin.deleteUser(newUserId)
    return { error: 'Failed to create user profile' }
  }
  
  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .insert({
      user_id: newUserId,
      company_id: companyId,
      full_name: fullName,
      job_title: jobTitle,
      department: department,
      date_of_joining: dateOfJoining
    })
    .select('id')
    .single()
    
  if (employeeError || !employeeData) {
    return { error: 'Failed to create employee record' }
  }
  
  const employeeId = employeeData.id
  
  // Default Leave Balances
  await supabase.from('leave_balances').insert([
    { employee_id: employeeId, leave_type: 'paid', allocated_days: 24, used_days: 0 },
    { employee_id: employeeId, leave_type: 'sick', allocated_days: 7, used_days: 0 },
    { employee_id: employeeId, leave_type: 'unpaid', allocated_days: 0, used_days: 0 }
  ])
  
  // Salary Structure (defaults)
  await supabase.from('salary_structures').insert({
    employee_id: employeeId,
    company_id: companyId,
    monthly_wage: 0
  })
  
  revalidatePath('/employees')
  
  return { 
    success: true, 
    loginId, 
    tempPassword 
  }
}

export async function getEmployees() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*, users!inner(email, role, login_id)')
    .order('created_at', { ascending: false })
    
  if (error) return { error: error.message }
  return { employees: data }
}

export async function getEmployeeById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*, users!inner(email, role, login_id)')
    .eq('id', id)
    .single()
    
  if (error) return { error: error.message }
  return { employee: data }
}
