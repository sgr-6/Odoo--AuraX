import React from "react"
import Link from "next/link"

export type StatusVariant = "present" | "absent" | "leave"

interface EmployeeCardProps {
  id: string
  name: string
  role: string
  status: StatusVariant
  avatarUrl?: string
}

export function EmployeeCard({ id, name, role, status, avatarUrl }: EmployeeCardProps) {
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
          background-color: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 32px 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
        }

        .emp-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 128, 128, 0.5); /* cyan accent */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 128, 128, 0.2);
        }

        .emp-card-top-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(0, 128, 128, 0.8), rgba(157, 78, 221, 0.8), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
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
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .emp-card-status-dot.present {
          background-color: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
          animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(34, 197, 94, 0.8); }
          50% { opacity: .7; box-shadow: 0 0 20px rgba(34, 197, 94, 1); }
        }

        .emp-card-status-dot.absent {
          background-color: #eab308;
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.8);
        }

        .emp-card-avatar-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 16px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          overflow: hidden;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        .emp-card:hover .emp-card-avatar-container {
          border-color: rgba(0, 128, 128, 0.6);
        }

        .emp-card-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .emp-card-avatar-fallback {
          color: #e4e4e7;
          font-size: 28px;
          font-weight: 700;
          font-family: sans-serif;
        }

        .emp-card-name {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          font-family: sans-serif;
          transition: color 0.3s ease;
        }

        .emp-card:hover .emp-card-name {
          color: #00ffff; /* glowing cyan on hover */
        }

        .emp-card-role {
          margin: 0;
          font-size: 14px;
          color: #d1d5db; /* light gray */
          font-family: sans-serif;
        }
      `}</style>
      
      <Link href={`/profile/${id}`} className="emp-card-link">
        <div className="emp-card">
          <div className="emp-card-top-accent" />
          
          <div className="emp-card-status" title={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}>
            {status === "leave" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill={statusColor} xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 0 8px ${statusColor})` }}>
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
          <p className="emp-card-role">{role}</p>
        </div>
      </Link>
    </>
  )
}
