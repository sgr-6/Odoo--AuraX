// @ts-nocheck
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProfileClient } from './ProfileClient';
import { getEmployeeById } from '@/actions/employees';
import { getSalary } from '@/actions/salary';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  const { employee } = await getEmployeeById(params.id);
  
  if (!employee) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">Employee not found.</div>
      </DashboardLayout>
    );
  }
  
  let initialSalary = null;
  if (user.profile.role === 'admin') {
    const { salary } = await getSalary(params.id);
    initialSalary = salary || null;
  }
  
  const currentUserObj = {
    id: user.auth.id,
    empId: user.profile.id, // wait, user profile is in `users` table which is 1:1 with auth.id, employee is `employees.user_id` = user.id. Wait! CurrentUser empId? 
    // In db, `employees.user_id` maps to user.id. So employee.user_id = user.auth.id
    role: user.profile.role,
  };
  
  // Actually, let's fix isSelf logic in client: `isSelf = currentUser.authId === employee.user_id`
  
  return (
    <DashboardLayout>
      <ProfileClient 
        employee={employee} 
        currentUser={{...currentUserObj, authId: user.auth.id}} 
        initialSalary={initialSalary} 
      />
    </DashboardLayout>
  );
}

