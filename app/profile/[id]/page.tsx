"use client"

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useGlobalStore, EmployeeSalary } from "@/lib/store/GlobalStore"

export default function ProfilePage({ params }: { params: { id: string } }) {
  const store = useGlobalStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [salaryError, setSalaryError] = useState('');

  if (!store?.isHydrated) return null;

  const employee = store.employees.find(e => e.id === params.id);
  const currentUser = store.currentUser;
  
  if (!employee || !currentUser) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">Employee not found.</div>
      </DashboardLayout>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const isSelf = currentUser.empId === employee.id;
  const canEditAll = isAdmin;
  const canEditPersonal = isAdmin || isSelf;

  const [formData, setFormData] = useState({
    phone: employee.phone || '',
    address: employee.address || '',
    avatarFallback: employee.avatarFallback || employee.name.charAt(0),
    department: employee.department || '',
    role: employee.role || '',
    basic: employee.salary?.basic || 0,
    hra: employee.salary?.hra || 0,
    allowances: employee.salary?.allowances || 0,
  });

  const handleSave = () => {
    if (activeTab === 'salary') {
      const total = formData.basic + formData.hra + formData.allowances;
      if (total !== 100) {
        setSalaryError(`Salary components must sum to 100%. Current sum is ${total}%.`);
        return;
      }
      setSalaryError('');
      store.updateSalary(employee.id, {
        basic: formData.basic,
        hra: formData.hra,
        allowances: formData.allowances
      });
      setIsEditing(false);
      return;
    }

    if (activeTab === 'personal') {
      store.updateProfile(employee.id, {
        phone: formData.phone,
        address: formData.address,
        avatarFallback: formData.avatarFallback
      });
    }

    if (activeTab === 'job' && canEditAll) {
      store.updateProfile(employee.id, {
        department: formData.department,
        role: formData.role
      });
    }

    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md relative group">
            {isEditing && canEditPersonal ? (
              <input 
                type="text" 
                maxLength={1}
                className="w-full h-full text-center bg-transparent outline-none uppercase"
                value={formData.avatarFallback}
                onChange={e => setFormData({ ...formData, avatarFallback: e.target.value.toUpperCase() })}
              />
            ) : (
              employee.avatarFallback || employee.name.charAt(0)
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-indigo-600 font-medium">{employee.role}</p>
            <p className="text-gray-500 text-sm mt-1">{employee.email}</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide
              ${employee.status === 'present' ? 'bg-emerald-100 text-emerald-700' : ''}
              ${employee.status === 'absent' ? 'bg-rose-100 text-rose-700' : ''}
              ${employee.status === 'leave' ? 'bg-amber-100 text-amber-700' : ''}
              ${employee.status === 'half-day' ? 'bg-sky-100 text-sky-700' : ''}
            `}>
              {employee.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
          {(['personal', 'job', 'salary', 'documents'] as const).map(tab => (
            <button
              key={tab}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap
                ${activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => {
                setActiveTab(tab);
                setIsEditing(false);
                setSalaryError('');
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab} Details</h2>
            {/* Show edit button based on permissions */}
            {!isEditing && (
              ((activeTab === 'personal' && canEditPersonal) || 
               (activeTab === 'job' && canEditAll) || 
               (activeTab === 'salary' && canEditAll)) && (
                <button className="btn-secondary text-sm px-4 py-2" onClick={() => setIsEditing(true)}>
                  Edit {activeTab}
                </button>
              )
            )}
          </div>

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                {isEditing && canEditPersonal ? (
                  <input type="tel" className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:border-indigo-500" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                ) : (
                  <div className="text-gray-900 font-medium text-lg">{employee.phone || '—'}</div>
                )}
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Home Address</label>
                {isEditing && canEditPersonal ? (
                  <textarea className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:border-indigo-500 min-h-[100px]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                ) : (
                  <div className="text-gray-900 font-medium text-lg">{employee.address || '—'}</div>
                )}
              </div>
            </div>
          )}

          {/* Job Tab */}
          {activeTab === 'job' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Department</label>
                {isEditing && canEditAll ? (
                  <input type="text" className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:border-indigo-500" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                ) : (
                  <div className="text-gray-900 font-medium text-lg">{employee.department}</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role</label>
                {isEditing && canEditAll ? (
                  <input type="text" className="p-3 border border-gray-200 rounded-lg w-full outline-none focus:border-indigo-500" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                ) : (
                  <div className="text-gray-900 font-medium text-lg">{employee.role}</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Joined At</label>
                <div className="text-gray-900 font-medium text-lg">{employee.joinedAt}</div>
              </div>
            </div>
          )}

          {/* Salary Tab */}
          {activeTab === 'salary' && (
            <div>
              {salaryError && <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg">{salaryError}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <div className="text-sm font-medium text-indigo-800 uppercase tracking-wide mb-2">Basic Pay (%)</div>
                  {isEditing && canEditAll ? (
                    <input type="number" min="0" max="100" className="p-2 border border-indigo-200 rounded-lg w-full" value={formData.basic} onChange={e => setFormData({ ...formData, basic: parseInt(e.target.value) || 0 })} />
                  ) : (
                    <div className="text-3xl font-bold text-indigo-900">{employee.salary?.basic || 0}%</div>
                  )}
                </div>
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide mb-2">HRA (%)</div>
                  {isEditing && canEditAll ? (
                    <input type="number" min="0" max="100" className="p-2 border border-emerald-200 rounded-lg w-full" value={formData.hra} onChange={e => setFormData({ ...formData, hra: parseInt(e.target.value) || 0 })} />
                  ) : (
                    <div className="text-3xl font-bold text-emerald-900">{employee.salary?.hra || 0}%</div>
                  )}
                </div>
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <div className="text-sm font-medium text-amber-800 uppercase tracking-wide mb-2">Allowances (%)</div>
                  {isEditing && canEditAll ? (
                    <input type="number" min="0" max="100" className="p-2 border border-amber-200 rounded-lg w-full" value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: parseInt(e.target.value) || 0 })} />
                  ) : (
                    <div className="text-3xl font-bold text-amber-900">{employee.salary?.allowances || 0}%</div>
                  )}
                </div>
              </div>
              
              {!isEditing && (
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">Note:</span> Salary structure is calculated as a percentage of total compensation. Total must equal 100%.
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              {employee.documents && employee.documents.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {employee.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <a href={doc.url} className="text-indigo-600 hover:underline text-sm font-medium">Download</a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Save/Cancel actions for any edit mode */}
          {isEditing && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              <button className="btn-primary" onClick={handleSave}>Save Changes</button>
              <button className="btn-secondary" onClick={() => { setIsEditing(false); setSalaryError(''); }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
