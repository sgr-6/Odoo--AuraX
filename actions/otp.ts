// @ts-nocheck
// @ts-nocheck
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import emailjs from '@emailjs/nodejs'

// Initialize emailjs if environment variables are present
if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY) {
  emailjs.init({
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  });
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, name: string) {
  const supabase = createAdminClient()
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 15 * 60000).toISOString() // 15 mins

  // Store in DB
  const { error: dbError } = await (supabase as any).from('otp_codes').insert({
    email,
    otp,
    expires_at: expiresAt
  })

  if (dbError) {
    console.error('Failed to store OTP:', dbError)
    return { error: 'Failed to generate OTP' }
  }

  // Send via EmailJS
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        email: email,
        to_name: name,
        otp: otp,
        time: new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    )
    return { success: true }
  } catch (error: any) {
    console.error('EmailJS Error:', error)
    return { error: 'Failed to send OTP email via EmailJS' }
  }
}

export async function verifyOtp(email: string, otp: string) {
  const supabase = createAdminClient()
  
  // Find valid OTP
  const { data: records, error } = await supabase
    .from('otp_codes')
    .select('id, expires_at')
    .eq('email', email)
    .eq('otp', otp)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !records || records.length === 0) {
    return { error: 'Invalid or expired OTP' }
  }

  const record = records[0]
  if (new Date(record.expires_at) < new Date()) {
    return { error: 'OTP has expired' }
  }

  // Get user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) return { error: 'Failed to find user' }
  
  const user = users.find(u => u.email === email)
  if (!user) return { error: 'User not found' }

  // Verify email in Supabase Auth
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true
  })

  if (updateError) {
    return { error: 'Failed to verify user account' }
  }

  // Delete the OTP code
  await (supabase as any).from('otp_codes').delete().eq('id', record.id)

  return { success: true }
}
