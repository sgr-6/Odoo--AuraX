'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signUpCompany(formData: FormData) {
  const supabase = createClient()
  
  const companyName = formData.get('companyName') as string
  const adminName = formData.get('adminName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  
  if (!companyName || !adminName || !email || !password) {
    return { error: 'Missing required fields' }
  }
  
  // Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create user' }
  }
  
  // Transaction-like behaviour - if company creation fails, user is stuck, but we rely on RLS and DB constraints.
  // Ideally this would be an RPC call to a stored procedure to be fully atomic.
  
  // 1. Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name: companyName })
    .select('id')
    .single()
    
  if (companyError || !company) {
    return { error: 'Failed to create company' }
  }
  
  // 2. Create user role profile
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      company_id: company.id,
      email: email,
      login_id: email, // admin uses email as login_id for simplicity, or we can generate one
      role: 'admin',
      must_change_password: false // admin sets their own password at signup
    })
    
  if (userError) {
    return { error: 'Failed to create admin profile' }
  }
  
  return { success: true }
}

export async function signIn(formData: FormData) {
  const supabase = createClient()
  
  const loginIdOrEmail = formData.get('loginId') as string
  const password = formData.get('password') as string
  
  if (!loginIdOrEmail || !password) {
    return { error: 'Missing credentials' }
  }
  
  let email = loginIdOrEmail
  
  // Check if it's a login_id instead of an email
  if (!loginIdOrEmail.includes('@')) {
    // We need to look up the email using the service role or a secure RPC, 
    // because unauthenticated users might not have read access to 'users' table due to RLS.
    const { data, error } = await supabase.rpc('get_email_by_login_id', { p_login_id: loginIdOrEmail })
    
    if (error || !data) {
      return { error: 'Invalid login ID' }
    }
    email = data
  }
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) return null
  
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single()
    
  if (profileError) return null
  
  return { auth: user, profile }
}

export async function changePassword(formData: FormData) {
  const supabase = createClient()
  
  const newPassword = formData.get('newPassword') as string
  
  if (!newPassword) {
    return { error: 'New password is required' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // Update Supabase Auth password
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (authError) {
    return { error: authError.message }
  }
  
  // Update must_change_password flag
  const { error: dbError } = await supabase
    .from('users')
    .update({ must_change_password: false })
    .eq('id', user.id)
    
  if (dbError) {
    return { error: dbError.message }
  }
  
  revalidatePath('/', 'layout')
  return { success: true }
}
