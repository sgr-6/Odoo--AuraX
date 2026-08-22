// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role to bypass auth constraints in seed
const supabase = createClient(supabaseUrl, supabaseKey);

async function addDiya() {
  const { data: users } = await supabase.from('users').select('id, company_id').eq('email', 'odoohrtemp@gmail.com').single();
  if (users) {
      console.log('Found user:', users.id);
      const { error } = await supabase.from('employees').upsert({
          user_id: users.id,
          company_id: users.company_id,
          full_name: 'Diya Sharma',
          job_title: 'HR Admin',
          department: 'HR',
          date_of_joining: new Date().toISOString().split('T')[0]
      });
      if (error) console.error(error);
      else console.log('Successfully added Diya Sharma to employees!');
  }
}

addDiya().catch(console.error);
