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
    doj: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out forwards;
        }

        .modal-content {
          background: rgba(20, 20, 25, 0.85);
          border: 1px solid rgba(0, 128, 128, 0.3);
          border-radius: 20px;
          padding: 2.5rem;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.2);
          position: relative;
          transform: translateY(20px);
          opacity: 0;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
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
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .modal-close-btn:hover {
          color: #ffffff;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0 0 2rem 0;
        }

        .form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: #e2e8f0;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-input {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }
        
        /* Fix for date picker icon on dark background */
        .form-input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #008080, #6366f1);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 128, 128, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 128, 128, 0.5);
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
          
          <h2 className="modal-title">Create Employee</h2>
          <p className="modal-subtitle">Add a new team member to Dayflow.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input required type="text" id="name" name="name" className="form-input" value={formData.name} onChange={handleChange} />
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

            <button type="submit" className="submit-btn">Create Employee</button>
          </form>
        </div>
      </div>
    </>
  );
}
