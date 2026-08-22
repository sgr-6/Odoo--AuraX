// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: employees } = await supabase.from('employees').select('id, user_id, full_name, users(email, login_id)');
  
  if (!employees) return;

  let fileContent = '--- EMPLOYEE LOGIN CREDENTIALS ---\n\n';

  for (const emp of employees) {
    if (!emp.users) continue;
    
    const nameParts = emp.full_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[1] : '';
    
    // Generate new strong password with their name
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPassword = `${firstName}@${randomNum}#Odoo`;
    
    // Generate new gmail based on their name
    const newEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@gmail.com`;

    // 1. Update Auth User
    const { error: authError } = await supabase.auth.admin.updateUserById(emp.user_id, {
      email: newEmail,
      password: newPassword,
      email_confirm: true
    });

    if (authError) {
      console.error(`Failed to update auth for ${emp.full_name}:`, authError.message);
      continue;
    }

    // 2. Update Users table
    await supabase.from('users').update({
      email: newEmail
    }).eq('id', emp.user_id);

    fileContent += `Name: ${emp.full_name}\n`;
    fileContent += `Employee ID: ${emp.users.login_id}\n`;
    fileContent += `Email: ${newEmail}\n`;
    fileContent += `Password: ${newPassword}\n`;
    fileContent += `----------------------------------------\n`;
  }
  
  fs.writeFileSync(path.join(process.cwd(), 'employee_credentials.txt'), fileContent);
  console.log('Successfully updated credentials and wrote to employee_credentials.txt');
}

run().catch(console.error);
