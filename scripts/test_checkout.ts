import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Logging in as Aarav...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'aarav.patel8412@gmail.com',
    password: 'Aarav@8412#Odoo'
  });
  if (authErr) {
    console.error('Login error:', authErr.message);
    return;
  }
  
  const user = auth.user;
  
  // Get employee
  const { data: employee, error: empErr } = await supabase
    .from('employees')
    .select('id, company_id')
    .eq('user_id', user.id)
    .single();
    
  if (empErr) {
    console.error('Employee fetch error:', empErr.message);
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  console.log('Fetching today attendance...');
  const { data: existing, error: fetchError } = await supabase
    .from('attendance')
    .select('id, check_in, check_out')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .single()
    
  if (fetchError || !existing) {
    console.log('No check-in found for today', fetchError);
    return;
  }
  
  console.log('Attempting to checkout...', existing);
  const checkInTime = new Date(existing.check_in)
  const checkOutTime = new Date(now)
  const hoursDiff = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
  const workHours = Math.round(hoursDiff * 100) / 100 
  
  const { data, error } = await supabase
    .from('attendance')
    .update({
      check_out: now,
      work_hours: workHours,
      extra_hours: 0
    })
    .eq('id', existing.id)
    .select();
    
  if (error) {
    console.error('UPDATE ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

run();
