// @ts-nocheck
import React from "react"
import Link from "next/link"
import { useGlobalStore } from "@/lib/store/GlobalStore"

export type StatusVariant = "present" | "absent" | "leave"

interface EmployeeCardProps {
  id: string
  name: string
  role: string
  status: StatusVariant
  avatarUrl?: string
}

export function EmployeeCard({ id, name, role, status, avatarUrl }: EmployeeCardProps) {
  const store = useGlobalStore()
  const getStatusColor = () => {
    if (status === "present") return "#22c55e" // green-500
    if (status === "absent") return "#eab308" // yellow-500
    if (status === "leave") return "#00ffff" // cyan
    return "#eab308"
  }

  const statusColor = getStatusColor()

  return (
    <>
      <style>{`
        .emp-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .emp-card {
          position: relative;
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 32px 24px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          overflow: hidden;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
        }

        .emp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: #D1D5DB;
        }

        .emp-card-top-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: #4F46E5;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .emp-card:hover .emp-card-top-accent {
          opacity: 1;
        }

        .emp-card-status {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emp-card-status-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
        }

        .emp-card-status-dot.present {
          background-color: #16A34A;
        }

        .emp-card-status-dot.absent {
          background-color: #F59E0B;
        }

        .emp-card-avatar-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 16px;
          overflow: hidden;
          background-color: #EEF2FF; /* Soft accent tint */
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #E0E7FF;
        }

        .emp-card-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .emp-card-avatar-fallback {
          color: #4F46E5;
          font-size: 28px;
          font-weight: 600;
          font-family: sans-serif;
        }

        .emp-card-name {
          margin: 0 0 4px 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #1F2937;
          font-family: sans-serif;
          transition: color 0.2s ease;
        }

        .emp-card:hover .emp-card-name {
          color: #4F46E5;
        }

        .emp-card-role {
          margin: 0;
          font-size: 0.9rem;
          color: #6B7280;
          font-family: sans-serif;
        }
      `}</style>
      
      <Link href={`/profile/${id}`} className="emp-card-link">
        <div className="emp-card">
          <div className="emp-card-top-accent" />
          
          <div className="emp-card-status" title={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}>
            {status === "leave" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#6B7280" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.8 19.2L16 11l4-4c1.1-1.1 2-3.2 2-3.2s-2.1.9-3.2 2l-4 4-8.2-1.8L4 9.5l6 2.5-4 4-3 1 1 3 4-4 2.5 6 1.5-2.8-1.8-8.2z" />
              </svg>
            ) : (
              <div className={`emp-card-status-dot ${status}`} />
            )}
          </div>

          <div className="emp-card-avatar-container">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="emp-card-avatar-img" />
            ) : (
              <span className="emp-card-avatar-fallback">{name.charAt(0)}</span>
            )}
          </div>
          
          <h4 className="emp-card-name">{name}</h4>
          <p className="emp-card-role mb-4">{role}</p>

          <div className="flex gap-2 mt-2 w-full px-4 relative z-10">
            {status !== "present" && status !== "leave" && (
              <button 
                className="flex-1 btn-primary text-xs py-2 px-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  store?.checkIn(id);
                }}
              >
                Check In
              </button>
            )}
            {status === "present" && (
              <button 
                className="flex-1 btn-secondary text-xs py-2 px-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  store?.checkOut(id);
                }}
              >
                Check Out
              </button>
            )}
            {status === "leave" && (
              <span className="flex-1 text-center text-xs font-medium text-gray-500 py-2 bg-gray-50 rounded-md border border-gray-200">
                On Leave
              </span>
            )}
          </div>
        </div>
      </Link>
    </>
  )
}
