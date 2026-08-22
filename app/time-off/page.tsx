// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { getLeaveBalances, getLeaveRequests } from '@/actions/leave';
import { getCurrentUser } from '@/actions/auth';
import { LeaveClient } from './LeaveClient';
import { redirect } from 'next/navigation';

export default async function TimeOffPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isAdmin = user.profile.role === 'admin';
  
  // Need employee ID for Employee View
  let balances = [];
  let requests = [];

  if (isAdmin) {
    const res = await getLeaveRequests();
    requests = res.requests || [];
  } else {
    const balRes = await getLeaveBalances();
    balances = balRes.balances || [];
    
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { data: emp } = await supabase.from('employees').select('id').eq('user_id', user.auth.id).single();
    
    if (emp) {
      const reqRes = await getLeaveRequests(emp.id);
      requests = reqRes.requests || [];
    }
  }

  return (
    <DashboardLayout>
      <LeaveClient 
        isAdmin={isAdmin} 
        initialBalances={balances} 
        initialRequests={requests} 
      />
    </DashboardLayout>
  );
}
