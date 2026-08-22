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
  
  console.log('Attempting to insert attendance...');
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      employee_id: employee.id,
      company_id: employee.company_id,
      date: today,
      check_in: now,
      status: 'present'
    })
    .select();
    
  if (error) {
    console.error('INSERT ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

run();
