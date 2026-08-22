// @ts-nocheck
// @ts-nocheck
"use client"

import React, { useState } from 'react';
import { EmployeeCard } from "@/components/dashboard/EmployeeCard"
import AddEmployeeModal from "@/components/dashboard/AddEmployeeModal"

export default function DashboardClient({ employees }: { employees: any[] }) {
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 mt-4 gap-6">
        <div className="mb-2 sm:mb-0 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1F2937] pb-2">Employees</h1>
          <p className="mt-1 font-medium text-[#6B7280]">
            Manage your team members and view their current status.
          </p>
        </div>
        
        <button 
          className="btn-primary shrink-0"
          onClick={() => setEmployeeModalOpen(true)}
        >
          <span className="icon text-lg leading-none">+</span> Add Employee
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem', 
        paddingBottom: '4rem' 
      }}>
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            id={emp.id}
            name={emp.full_name}
            role={emp.job_title || 'Employee'}
            status={'Active'}
          />
        ))}
      </div>

      {isEmployeeModalOpen && (
        <AddEmployeeModal 
          onClose={() => setEmployeeModalOpen(false)} 
        />
      )}
    </>
  )
}
