"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'work' | 'private' | 'salary'>('work');

  // Mock employee data based on ID
  const employee = {
    id: params.id,
    name: 'Alice Johnson',
    role: 'Software Engineer',
    status: 'Present',
    avatarFallback: 'A',
    work: {
      department: 'Engineering',
      manager: 'John Smith',
      doj: 'Jan 15, 2024',
      workEmail: 'alice.j@dayflow.com',
      workPhone: '+1 (555) 123-4567',
    },
    private: {
      homeAddress: '123 Cosmos Way, Nebula City, Space 001',
      emergencyContact: 'Bob Johnson - (555) 987-6543',
      dob: 'Oct 04, 1992',
    },
    salary: {
      bankName: 'Galactic Bank',
      accountNumber: '**** **** **** 1234',
      currentSalary: '$120,000 / year',
      contractType: 'Full-Time',
    }
  }

  return (
    <DashboardLayout>
      <style>{`
        .profile-container {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          width: fit-content;
        }

        .back-link:hover {
          color: #00ffff;
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
          transform: translateX(-4px);
        }

        /* Profile Header */
        .profile-header-glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          padding: 3rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 2.5rem;
          position: relative;
          overflow: hidden;
        }

        .profile-header-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #008080, #9d4edd, #008080);
          background-size: 200% auto;
          animation: shine 4s linear infinite;
        }

        .profile-avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          border: 3px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05);
        }

        .profile-info h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
        }

        .profile-info p {
          font-size: 1.1rem;
          color: #A0AEC0;
          margin: 0 0 1rem 0;
        }

        .profile-status {
          display: inline-block;
          padding: 0.4rem 1.2rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Tabs System */
        .tabs-container {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          color: #ffffff;
          background: rgba(157, 78, 221, 0.2); /* purple tint */
          box-shadow: 0 4px 15px rgba(157, 78, 221, 0.3);
          border: 1px solid rgba(157, 78, 221, 0.3);
        }

        /* Tab Content Glass */
        .tab-content-glass {
          background: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }

        .data-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .data-label {
          font-size: 0.85rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .data-value {
          font-size: 1.1rem;
          color: #f1f5f9;
          font-weight: 500;
        }
      `}</style>
      
      <div className="profile-container">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <div className="profile-header-glass">
          <div className="profile-header-accent" />
          <div className="profile-avatar-large">
            {employee.avatarFallback}
          </div>
          <div className="profile-info">
            <h1>{employee.name}</h1>
            <p>{employee.role}</p>
            <div className="profile-status">
              {employee.status}
            </div>
          </div>
        </div>

        {/* Tabs System */}
        <div>
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'work' ? 'active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              Work Information
            </button>
            <button 
              className={`tab-btn ${activeTab === 'private' ? 'active' : ''}`}
              onClick={() => setActiveTab('private')}
            >
              Private Information
            </button>
            <button 
              className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary')}
            >
              HR / Salary
            </button>
          </div>

          <div className="tab-content-glass">
            {activeTab === 'work' && (
              <div className="data-grid">
                <div className="data-group">
                  <span className="data-label">Department</span>
                  <span className="data-value">{employee.work.department}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Manager</span>
                  <span className="data-value">{employee.work.manager}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Date of Joining</span>
                  <span className="data-value">{employee.work.doj}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Work Email</span>
                  <span className="data-value">{employee.work.workEmail}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Work Phone</span>
                  <span className="data-value">{employee.work.workPhone}</span>
                </div>
              </div>
            )}

            {activeTab === 'private' && (
              <div className="data-grid">
                <div className="data-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="data-label">Home Address</span>
                  <span className="data-value">{employee.private.homeAddress}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Emergency Contact</span>
                  <span className="data-value">{employee.private.emergencyContact}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Date of Birth</span>
                  <span className="data-value">{employee.private.dob}</span>
                </div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="data-grid">
                <div className="data-group">
                  <span className="data-label">Contract Type</span>
                  <span className="data-value">{employee.salary.contractType}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Current Salary</span>
                  <span className="data-value">{employee.salary.currentSalary}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Bank Name</span>
                  <span className="data-value">{employee.salary.bankName}</span>
                </div>
                <div className="data-group">
                  <span className="data-label">Account Number</span>
                  <span className="data-value">{employee.salary.accountNumber}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
