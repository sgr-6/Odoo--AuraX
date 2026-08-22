import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const addresses = [
  '123 MG Road, Bengaluru, Karnataka 560001',
  '45 Andheri West, Mumbai, Maharashtra 400053',
  '89 Cyber City, Gurugram, Haryana 122002',
  '7 Banjara Hills, Hyderabad, Telangana 500034',
  '12 Anna Salai, Chennai, Tamil Nadu 600002',
  '56 Koregaon Park, Pune, Maharashtra 411001',
  '34 Salt Lake Sector V, Kolkata, West Bengal 700091',
  '90 Connaught Place, New Delhi, Delhi 110001',
  '23 Viman Nagar, Pune, Maharashtra 411014',
  '67 Whitefield, Bengaluru, Karnataka 560066',
  '21 Jubilee Hills, Hyderabad, Telangana 500033'
];

async function run() {
  const { data: employees } = await supabase.from('employees').select('id, full_name, company_id, address, avatar_url');
  
  if (!employees) return;

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    
    // 1. Update address & avatar
    const randomAddress = addresses[i % addresses.length];
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(emp.full_name)}`;
    
    let updates: any = {};
    if (!emp.address) updates.address = randomAddress;
    if (!emp.avatar_url) updates.avatar_url = avatarUrl;
    
    if (Object.keys(updates).length > 0) {
      await supabase.from('employees').update(updates).eq('id', emp.id);
    }

    // 2. Update Salary Structure
    const { data: salary } = await supabase.from('salary_structures').select('*').eq('employee_id', emp.id).single();
    if (salary) {
      const wage = Number(salary.monthly_wage) || (50000 + Math.random() * 50000);
      
      // If basic is 0, it means it's empty
      if (Number(salary.basic) === 0) {
        const basic = wage * 0.40;
        const hra = basic * 0.40;
        const standard = wage * 0.10;
        const performance = wage * 0.10;
        const travel = wage * 0.05;
        const fixed = wage * 0.05;
        
        await supabase.from('salary_structures').update({
          monthly_wage: wage,
          basic,
          hra,
          standard_allowance: standard,
          performance_bonus: performance,
          travel_allowance: travel,
          fixed_allowance: fixed
        }).eq('id', salary.id);
      }
    }
    
    // Seed some attendance records if they don't exist
    const { count } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('employee_id', emp.id);
    if (count === 0) {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Random check in between 8:30 and 9:30 AM
        const checkIn = new Date(today);
        checkIn.setHours(8, 30 + Math.floor(Math.random() * 60), 0);
        
        // Random check out between 5:30 and 6:30 PM
        const checkOut = new Date(today);
        checkOut.setHours(17, 30 + Math.floor(Math.random() * 60), 0);
        
        const workHours = Math.round(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) * 100) / 100;
        
        await supabase.from('attendance').insert({
            employee_id: emp.id,
            company_id: emp.company_id,
            date: dateStr,
            check_in: checkIn.toISOString(),
            check_out: checkOut.toISOString(),
            status: 'present',
            work_hours: workHours,
            extra_hours: Math.max(0, workHours - 8)
        });
    }
  }
  
  console.log('Seeded random details for empty fields!');
}

run().catch(console.error);
