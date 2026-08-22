"use client"

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { EmployeeCard } from "@/components/dashboard/EmployeeCard"
import AddEmployeeModal from "@/components/dashboard/AddEmployeeModal"
import { StatusVariant } from "@/components/ui/status-dot"

const mockEmployees = [
  { id: "1", name: "Alice Johnson", role: "Software Engineer", status: "present" as StatusVariant },
  { id: "2", name: "Bob Smith", role: "Product Manager", status: "absent" as StatusVariant },
  { id: "3", name: "Charlie Davis", role: "UX Designer", status: "leave" as StatusVariant },
  { id: "4", name: "Diana Prince", role: "Marketing Specialist", status: "present" as StatusVariant },
  { id: "5", name: "Ethan Hunt", role: "Sales Executive", status: "absent" as StatusVariant },
]

export default function DashboardPage() {
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight pb-2" style={{ color: "#ffffff" }}>Employees</h1>
            <p className="mt-2 font-medium" style={{ color: "#A0AEC0" }}>
              Manage your team members and view their current status.
            </p>
          </div>
          
          <button 
            className="add-emp-btn"
            onClick={() => setEmployeeModalOpen(true)}
          >
            <span className="icon">+</span> Add Employee
          </button>
        </div>
        
        {/* Decorative divider */}
        <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-purple-500/0 mb-2" />

        {/* CSS Grid for Employee Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          paddingBottom: '4rem' 
        }}>
          {mockEmployees.map((emp) => (
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
