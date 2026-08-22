import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DashboardClient from "./DashboardClient"
import { getEmployees } from "@/actions/employees"

export default async function DashboardPage() {
  const { employees } = await getEmployees();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <DashboardClient employees={employees || []} />
      </div>
    </DashboardLayout>
  )
}

