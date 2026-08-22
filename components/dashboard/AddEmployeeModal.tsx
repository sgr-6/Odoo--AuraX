"use client";

import React, { useState } from 'react';

interface AddEmployeeModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddEmployeeModal({ onClose, onSubmit }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    doj: ''
  });
  
  const [generatedCreds, setGeneratedCreds] = useState<{ loginId: string, tempPass: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate Login ID and Password
    const parts = formData.name.trim().split(' ');
    const firstName = parts[0] || 'XX';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : 'XX';
    const nameCode = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    
    const year = formData.doj ? new Date(formData.doj).getFullYear() : new Date().getFullYear();
    const loginId = `DF-${nameCode}-${year}-0001`;
    const tempPass = `TempPass123!`;

    setGeneratedCreds({ loginId, tempPass });
  };

  const handleComplete = () => {
    onSubmit({ ...formData, ...generatedCreds });
  };

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out forwards;
        }

        .modal-content {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 2.5rem;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
          transform: translateY(20px);
          opacity: 0;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          color: #475569;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          color: #6B7280;
          font-size: 0.95rem;
          margin: 0 0 2rem 0;
        }

        .form-group {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .form-label {
          color: #374151;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-input {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #1F2937;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #4F46E5;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .submit-btn {
          width: 100%;
          margin-top: 1rem;
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
          
          <h2 className="modal-title">Create Employee</h2>
          <p className="modal-subtitle">Add a new team member to Dayflow.</p>
          
          {!generatedCreds ? (
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh] px-1 -mx-1">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input required type="text" id="name" name="name" className="form-input" value={formData.name} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input required type="email" id="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone</label>
                <input required type="tel" id="phone" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="title">Job Title</label>
                <input required type="text" id="title" name="title" className="form-input" value={formData.title} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="department">Department</label>
                <input required type="text" id="department" name="department" className="form-input" value={formData.department} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="doj">Date of Joining</label>
                <input required type="date" id="doj" name="doj" className="form-input" value={formData.doj} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-primary submit-btn">Generate Credentials</button>
            </form>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="text-indigo-900 font-semibold mb-4 text-lg">Employee Created Successfully</h3>
                
                <div className="mb-4">
                  <span className="text-indigo-700 text-sm block mb-1">Login ID:</span>
                  <code className="bg-white px-3 py-2 rounded border border-indigo-100 text-indigo-700 block font-mono text-lg">{generatedCreds.loginId}</code>
                </div>
                
                <div className="mb-6">
                  <span className="text-indigo-700 text-sm block mb-1">Temporary Password:</span>
                  <code className="bg-white px-3 py-2 rounded border border-indigo-100 text-indigo-700 block font-mono text-lg">{generatedCreds.tempPass}</code>
                </div>
                
                <p className="text-indigo-600/80 text-sm italic">
                  Please securely share these credentials with the employee. They will be required to change their password upon first login.
                </p>
              </div>
              
              <button onClick={handleComplete} className="btn-primary submit-btn">Done</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
