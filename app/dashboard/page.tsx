// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DashboardClient from "./DashboardClient"
import { getEmployees } from "@/actions/employees"
import { getCurrentUser } from "@/actions/auth"

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Redirect employees to their own dashboard
  if (user.profile?.role === 'employee') {
    redirect('/employee-dashboard');
  }

  const { employees } = await getEmployees();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <DashboardClient employees={employees || []} />
      </div>
    </DashboardLayout>
  )
}
