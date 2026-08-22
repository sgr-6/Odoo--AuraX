// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: employees } = await supabase.from('employees').select('id, company_id, full_name').neq('full_name', 'Diya Sharma');
  
  if (!employees) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  
  console.log(`Seeding time-off requests...`);

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    
    // Seed different types of leaves across different employees
    let leaveType = 'paid';
    let remarks = 'Family function';
    let days = 2;
    let status = 'approved';
    
    if (i % 3 === 0) {
      leaveType = 'unpaid';
      remarks = 'Personal emergency, out of leave balance';
      days = 3;
    } else if (i % 3 === 1) {
      leaveType = 'sick';
      remarks = 'Viral fever';
      days = 1;
    }
    
    // Some are pending, some are approved
    if (i % 4 === 0) {
        status = 'pending';
    }
    
    // Set dates in the current month so it affects the current payroll
    const startDate = new Date(year, today.getMonth(), 10 + (i % 10)); // e.g. 10th to 20th of the month
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days - 1));

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    // Check if already requested
    const { count } = await supabase.from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', emp.id)
        .eq('start_date', startStr);

    if (count === 0) {
        const { error } = await supabase.from('leave_requests').insert({
            employee_id: emp.id,
            company_id: emp.company_id,
            leave_type: leaveType,
            start_date: startStr,
            end_date: endStr,
            remarks,
            status
        });
        
        if (error) {
            console.error(`Failed to insert leave for ${emp.full_name}:`, error.message);
        } else {
            console.log(`Inserted ${leaveType} leave for ${emp.full_name} (${startStr} to ${endStr}) - ${status}`);
            
            // If approved, update leave balances (for paid/sick)
            if (status === 'approved' && leaveType !== 'unpaid') {
                const { data: balance } = await supabase.from('leave_balances')
                    .select('id, used_days')
                    .eq('employee_id', emp.id)
                    .eq('leave_type', leaveType)
                    .single();
                
                if (balance) {
                    await supabase.from('leave_balances').update({
                        used_days: Number(balance.used_days) + days
                    }).eq('id', balance.id);
                }
            }
        }
    }
  }
  
  console.log('Seeded time off details successfully!');
}

run().catch(console.error);
