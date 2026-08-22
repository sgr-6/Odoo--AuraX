'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendOtpEmail, verifyOtp } from './otp'

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
  
  const adminAuthClient = createAdminClient()
  
  // Create user in Auth (auto-confirming because OTP is now for login instead)
  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create user' }
  }
  
  // 1. Create company
  const { data: company, error: companyError } = await adminAuthClient
    .from('companies')
    .insert({ name: companyName })
    .select('id')
    .single()
    
  if (companyError || !company) {
    return { error: 'Failed to create company' }
  }
  
  // 2. Create user role profile
  const { error: userError } = await adminAuthClient
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

export async function verifyLoginCredentials(formData: FormData) {
  const supabase = createAdminClient() // use admin client to verify without setting cookies
  
  const loginIdOrEmail = formData.get('loginId') as string
  const password = formData.get('password') as string
  
  if (!loginIdOrEmail || !password) {
    return { error: 'Missing credentials' }
  }
  
  let email = loginIdOrEmail
  
  // Check if it's a login_id instead of an email
  if (!loginIdOrEmail.includes('@')) {
    const { data, error } = await supabase.rpc('get_email_by_login_id', { p_login_id: loginIdOrEmail })
    if (error || !data) {
      return { error: 'Invalid login ID' }
    }
    email = data
  }
  
  // Verify password with Admin client (does not set browser cookies)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // Get full name for the email
  const { data: emp } = await supabase.from('employees').select('full_name').eq('user_id', data.user.id).single()
  const name = emp ? emp.full_name : 'User'

  // Send the OTP via EmailJS
  const otpRes = await sendOtpEmail(email, name)
  if (otpRes.error) {
    return { error: otpRes.error }
  }
  
  return { success: true, email }
}

export async function finalizeLogin(formData: FormData) {
  const supabase = createClient() // standard client to set cookies
  
  const loginIdOrEmail = formData.get('loginId') as string
  const password = formData.get('password') as string
  const otp = formData.get('otp') as string
  const email = formData.get('email') as string
  
  if (!loginIdOrEmail || !password || !otp || !email) {
    return { error: 'Missing information' }
  }
  
  // Verify OTP
  const otpCheck = await verifyOtp(email, otp)
  if (otpCheck.error) {
    return { error: otpCheck.error }
  }
  
  // OTP is valid! Now actually sign them in to set cookies.
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
  
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (authError) {
    return { error: authError.message }
  }
  
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
