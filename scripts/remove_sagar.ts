// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: employees } = await supabase
    .from('employees')
    .select('id, user_id, full_name')
    .ilike('full_name', '%sagar%');
    
  if (!employees || employees.length === 0) {
    console.log('No employees found with the name sagar.');
    return;
  }
  
  for (const emp of employees) {
    console.log(`Deleting ${emp.full_name}...`);
    
    // Auth user deletion automatically cascades to 'users' and 'employees' 
    // IF foreign keys are set up with ON DELETE CASCADE. 
    // Since we're not sure, let's delete manually in reverse order.
    
    // Delete attendance
    await supabase.from('attendance').delete().eq('employee_id', emp.id);
    
    // Delete leave balances & requests
    await supabase.from('leave_balances').delete().eq('employee_id', emp.id);
    await supabase.from('leave_requests').delete().eq('employee_id', emp.id);
    
    // Delete salary structures
    await supabase.from('salary_structures').delete().eq('employee_id', emp.id);
    
    // Delete from employees
    await supabase.from('employees').delete().eq('id', emp.id);
    
    // Delete from users
    await supabase.from('users').delete().eq('id', emp.user_id);
    
    // Delete from auth
    const { error } = await supabase.auth.admin.deleteUser(emp.user_id);
    if (error) {
        console.error(`Failed to delete auth user for ${emp.full_name}:`, error.message);
    } else {
        console.log(`Successfully deleted ${emp.full_name} completely.`);
    }
  }
}

run().catch(console.error);
