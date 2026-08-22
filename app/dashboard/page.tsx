"use client"

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { EmployeeCard } from "@/components/dashboard/EmployeeCard"
import AddEmployeeModal from "@/components/dashboard/AddEmployeeModal"
import { StatusVariant } from "@/components/ui/status-dot"

import { useGlobalStore } from "@/lib/store/GlobalStore"

export default function DashboardPage() {
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const store = useGlobalStore();
  
  if (!store?.isHydrated) return null; // Avoid hydration mismatch

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
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

        {/* CSS Grid for Employee Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          paddingBottom: '4rem' 
        }}>
          {store.employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              id={emp.id}
              name={emp.name}
              role={emp.role}
              status={emp.status}
            />
          ))}
        </div>

        {/* The Modal */}
        {isEmployeeModalOpen && (
          <AddEmployeeModal 
            onClose={() => setEmployeeModalOpen(false)} 
            onSubmit={(data) => {
              console.log("Saving data:", data);
              // Handle saving to database here in the future
              setEmployeeModalOpen(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
