// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { getTodayAttendance, getEmployeeAttendance } from '@/actions/attendance';
import { getEmployees } from '@/actions/employees';
import { getCurrentUser } from '@/actions/auth';
import { AttendanceClient } from './AttendanceClient';
import { redirect } from 'next/navigation';

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isAdmin = user.profile.role === 'admin';
  
  let initialData = [];
  let employeeList = [];

  if (isAdmin) {
    const { attendance } = await getTodayAttendance();
    initialData = attendance || [];
    
    const { employees } = await getEmployees();
    employeeList = employees || [];
  } else {
    const { attendance } = await getEmployeeAttendance();
    initialData = attendance || [];
  }

  return (
    <DashboardLayout>
      <AttendanceClient 
        isAdmin={isAdmin} 
        initialData={initialData} 
        employeeList={employeeList}
        currentUserId={user.auth.id}
      />
    </DashboardLayout>
  );
}
