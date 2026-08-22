"use client"

import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function Attendance() {
  const attendanceData = [
    { id: 1, name: 'Alice Johnson', role: 'Software Engineer', status: 'Present', time: '09:00 AM' },
    { id: 2, name: 'Bob Smith', role: 'Product Manager', status: 'On Leave', time: '-' },
    { id: 3, name: 'Charlie Davis', role: 'UX Designer', status: 'Present', time: '09:15 AM' },
  ];

  return (
    <DashboardLayout>
      <style>{`
        .attendance-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-simple {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
        }

        .page-subtitle {
          color: #A0AEC0;
          font-size: 1.1rem;
          margin: 0;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .attendance-card {
          position: relative;
          background-color: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .attendance-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 128, 128, 0.5);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 128, 128, 0.2);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .emp-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.25rem 0;
        }

        .emp-role {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }

        .status-badge {
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.present {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
        }

        .status-badge.onleave {
          background: rgba(6, 182, 212, 0.2);
          color: #22d3ee;
          border: 1px solid rgba(6, 182, 212, 0.3);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
        }

        .emp-time {
          font-family: monospace;
          color: #cbd5e1;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: block;
        }
      `}</style>
      <div className="attendance-container">
        <div className="header-simple">
          <div>
            <h1 className="page-title">Attendance Hub</h1>
            <p className="page-subtitle">Monitor daily team presence in real-time.</p>
          </div>
        </div>

        <div className="cards-grid">
          {attendanceData.map((record) => (
            <div key={record.id} className="attendance-card">
              <div className="card-top">
                <div>
                  <h3 className="emp-name">{record.name}</h3>
                  <p className="emp-role">{record.role}</p>
                </div>
                <span className={`status-badge ${record.status.replace(' ', '').toLowerCase()}`} title={`Status: ${record.status}`}>
                  {record.status}
                </span>
              </div>
              <span className="emp-time">Check-in: {record.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
