// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role to bypass auth constraints in seed
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const email = 'odoohrtemp@gmail.com';
  const password = 'OdooHR@789';
  const companyName = 'Odoo india';
  
  console.log('Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (authError) {
    if (authError.message.includes('already been registered')) {
        console.log('User already exists. Fetching user...');
    } else {
        console.error('Auth error:', authError);
        return;
    }
  }
  
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.error('Could not find user after creation step.');
    return;
  }
  
  console.log('User ID:', user.id);
  
  console.log('Creating company...');
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name: companyName })
    .select('id')
    .single();
    
  let compId;
  if (companyError) {
    console.log('Company creation error (maybe exists?), trying to fetch...', companyError.message);
    const { data: existingComp } = await supabase.from('companies').select('id').eq('name', companyName).limit(1).single();
    if (existingComp) compId = existingComp.id;
    else {
        console.error('Failed to create or fetch company.');
        return;
    }
  } else {
    compId = company.id;
  }
  
  console.log('Company ID:', compId);
  
  console.log('Creating admin profile...');
  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      company_id: compId,
      email: email,
      login_id: email,
      role: 'admin',
      must_change_password: false
    });
    
  if (profileError) {
    console.error('Profile error:', profileError);
    return;
  }
  
  console.log('Seed successful! You can now login with:');
  console.log('Email:', email);
  console.log('Password:', password);
}

seed().catch(console.error);
