// @ts-nocheck
// @ts-nocheck
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import { createClient } from '@/lib/supabase/server';

export default async function MyProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const supabase = createClient();
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.auth.id)
    .single();

  if (employee) {
    redirect(`/profile/${employee.id}`);
  } else {
    // Admins don't have an employee record by default unless created
    return (
      <div className="p-8 text-center text-gray-500">
        Admin profile page. (Not linked to an employee record).
      </div>
    );
  }
}
