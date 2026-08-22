"use client"

import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function TimeOff() {
  const leaveRequests = [
    { id: 1, name: 'Alice Johnson', type: 'Vacation', dates: 'Aug 25 - Aug 29', status: 'Approved' },
    { id: 2, name: 'Ethan Hunt', type: 'Sick Leave', dates: 'Aug 22', status: 'Pending' },
    { id: 3, name: 'Diana Prince', type: 'Personal', dates: 'Sep 01 - Sep 02', status: 'Rejected' },
  ];

  return (
    <DashboardLayout>
      <style>{`
        .timeoff-container {
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
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .antigravity-card {
          background: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .antigravity-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 128, 128, 0.5); /* cyan accent */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 128, 128, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1rem;
        }

        .emp-name {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .status-dot {
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-dot.approved {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
        }

        .status-dot.pending {
          background: rgba(234, 179, 8, 0.2);
          color: #facc15;
          border: 1px solid rgba(234, 179, 8, 0.3);
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
        }

        .status-dot.rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.85rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 1rem;
          color: #f1f5f9;
          font-weight: 500;
        }
      `}</style>
      <div className="timeoff-container">
        <div className="header-simple">
          <div>
            <h1 className="page-title">Time Off Requests</h1>
            <p className="page-subtitle">Review and manage employee leave applications.</p>
          </div>
          <button className="add-emp-btn">
            <span className="icon">+</span> New Request
          </button>
        </div>

        <div className="cards-grid">
          {leaveRequests.map((request) => (
            <div key={request.id} className="antigravity-card">
              <div className="card-header">
                <h3 className="emp-name">{request.name}</h3>
                <span className={`status-dot ${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Leave Type:</span>
                  <span className="info-value">{request.type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Dates:</span>
                  <span className="info-value">{request.dates}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
