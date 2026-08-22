// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10) + 'A1!'; // Ensuring complex enough just in case
}

async function seedEmployees() {
  const companyName = 'Odoo india';
  
  // 1. Get the company
  const { data: company } = await supabase.from('companies').select('id, name').eq('name', companyName).single();
  if (!company) {
    console.error('Could not find company', companyName);
    return;
  }
  
  // 2. Mock Indian Names
  const mockNames = [
    'Aarav Patel',
    'Vivaan Sharma',
    'Aditya Singh',
    'Vihaan Kumar',
    'Arjun Gupta',
    'Sai Iyer',
    'Ayaan Desai',
    'Krishna Reddy',
    'Ishaan Verma',
    'Shaurya Joshi'
  ];

  const jobTitles = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Specialist', 'Sales Executive', 'HR Assistant', 'Support Specialist', 'Quality Assurance', 'DevOps Engineer'];
  const departments = ['Engineering', 'Product', 'Design', 'Data', 'Marketing', 'Sales', 'HR', 'Support', 'Engineering', 'Engineering'];

  for (let i = 0; i < mockNames.length; i++) {
    const fullName = mockNames[i];
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts[1];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@odoo.com`;
    const dateOfJoining = `2026-08-${String(i + 1).padStart(2, '0')}`;
    
    console.log(`Seeding employee: ${fullName} (${email})...`);
    
    // Generate Login ID
    const compWords = company.name.trim().split(/\s+/);
    let compPrefix = '';
    if (compWords.length > 1) {
      compPrefix = compWords.map((w: string) => w[0]).join('').substring(0, 3).toUpperCase();
    } else {
      compPrefix = company.name.substring(0, 2).toUpperCase().padEnd(2, 'X');
    }
    
    const first = firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');
    const last = lastName.substring(0, 2).toUpperCase().padEnd(2, 'X');
    const year = new Date(dateOfJoining).getFullYear();
    
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id);
      
    const seq = ((count || 0) + 1).toString().padStart(4, '0');
    const loginId = `${compPrefix}${first}${last}${year}${seq}`;
    const password = generateTempPassword();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      console.log(`Skipping ${email}: ${authError.message}`);
      continue;
    }
    
    const newUserId = authData.user.id;
    
    // Insert into users
    const { error: userError } = await supabase.from('users').insert({
      id: newUserId,
      company_id: company.id,
      login_id: loginId,
      email: email,
      role: 'employee',
      must_change_password: true
    });
    
    if (userError) {
      console.error('Failed to create user profile:', userError);
      continue;
    }
    
    // Insert into employees
    const { data: employeeData, error: employeeError } = await supabase.from('employees').insert({
      user_id: newUserId,
      company_id: company.id,
      full_name: fullName,
      job_title: jobTitles[i],
      department: departments[i],
      date_of_joining: dateOfJoining
    }).select('id').single();
    
    if (employeeError) {
      console.error('Failed to create employee record:', employeeError);
      continue;
    }
    
    const employeeId = employeeData.id;
    
    // Default Leave Balances
    await supabase.from('leave_balances').insert([
      { employee_id: employeeId, leave_type: 'paid', allocated_days: 24, used_days: 0 },
      { employee_id: employeeId, leave_type: 'sick', allocated_days: 7, used_days: 0 },
      { employee_id: employeeId, leave_type: 'unpaid', allocated_days: 0, used_days: 0 }
    ]);
    
    // Salary Structure
    await supabase.from('salary_structures').insert({
      employee_id: employeeId,
      company_id: company.id,
      monthly_wage: 50000 + (Math.random() * 50000) // random wage between 50k - 100k
    });
    
    console.log(`Successfully created: ${fullName} | ID: ${loginId} | Password: ${password}`);
  }
  
  console.log('Finished seeding employees!');
}

seedEmployees().catch(console.error);
