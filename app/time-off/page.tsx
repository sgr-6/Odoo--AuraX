"use client"

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useGlobalStore } from "@/lib/store/GlobalStore"

export default function TimeOff() {
  const store = useGlobalStore();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [adminActionModal, setAdminActionModal] = useState<{ id: string, status: 'Approved' | 'Rejected' } | null>(null);
  const [adminComment, setAdminComment] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'Paid Leave',
    startDate: '',
    endDate: '',
    remarks: ''
  });

  if (!store?.isHydrated || !store?.currentUser) return null;

  const isAdmin = store.currentUser.role === 'admin';
  const myEmpId = store.currentUser.empId;

  // Filter requests
  let requests = store.timeOffRequests;
  if (!isAdmin && myEmpId) {
    requests = store.timeOffRequests.filter(r => r.empId === myEmpId);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myEmpId) return;

    store.requestTimeOff({
      empId: myEmpId,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      remarks: formData.remarks
    });

    setShowNewRequest(false);
    setFormData({ type: 'Paid Leave', startDate: '', endDate: '', remarks: '' });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminActionModal) return;
    
    store.updateTimeOffStatus(adminActionModal.id, adminActionModal.status, adminComment);
    setAdminActionModal(null);
    setAdminComment('');
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">Time Off</h1>
            <p className="mt-1 font-medium text-gray-500">
              {isAdmin ? "Manage employee leave requests." : "Manage your leave requests."}
            </p>
          </div>
          {!isAdmin && (
            <button 
              className="btn-primary"
              onClick={() => setShowNewRequest(true)}
            >
              + New Request
            </button>
          )}
        </div>

        <div className="grid gap-4">
          {requests.map(request => {
            const employee = store.employees.find(e => e.id === request.empId);
            return (
              <div key={request.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md hover:border-gray-300">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0
                    ${request.type === 'Paid Leave' ? 'bg-indigo-100 text-indigo-600' : ''}
                    ${request.type === 'Sick Leave' ? 'bg-rose-100 text-rose-600' : ''}
                    ${request.type === 'Unpaid Leave' ? 'bg-amber-100 text-amber-600' : ''}
                  `}>
                    {request.type === 'Sick Leave' ? '🤒' : '✈️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900 text-lg">{request.type}</h3>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider
                        ${request.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${request.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${request.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : ''}
                      `}>
                        {request.status}
                      </span>
                    </div>
                    {isAdmin && (
                      <p className="text-gray-900 font-medium mt-1">Requested by: {employee?.name}</p>
                    )}
                    <p className="text-gray-500 font-medium text-sm mt-1">
                      {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {request.remarks && (
                      <p className="text-gray-600 text-sm mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 italic">
                        "{request.remarks}"
                      </p>
                    )}
                    {request.adminComment && (
                      <p className={`text-sm mt-2 p-3 rounded-lg border italic
                        ${request.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
                      `}>
                        Admin response: "{request.adminComment}"
                      </p>
                    )}
                  </div>
                </div>

                {isAdmin && request.status === 'Pending' && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      className="flex-1 md:flex-none px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-medium transition-colors"
                      onClick={() => setAdminActionModal({ id: request.id, status: 'Approved' })}
                    >
                      Approve
                    </button>
                    <button 
                      className="flex-1 md:flex-none px-4 py-2 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-medium transition-colors"
                      onClick={() => setAdminActionModal({ id: request.id, status: 'Rejected' })}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {requests.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm text-gray-500">
              No leave requests found.
            </div>
          )}
        </div>

        {/* Employee Request Modal */}
        {showNewRequest && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Request Time Off</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Paid Leave">Paid Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Required)</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[100px]"
                    placeholder="Reason for leave..."
                    value={formData.remarks}
                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="submit" className="btn-primary flex-1">Submit Request</button>
                  <button type="button" className="btn-secondary flex-1" onClick={() => setShowNewRequest(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Action Modal */}
        {adminActionModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 overflow-hidden">
              <div className={`p-6 border-b border-gray-100 ${adminActionModal.status === 'Approved' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <h2 className={`text-xl font-bold ${adminActionModal.status === 'Approved' ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {adminActionModal.status} Request
                </h2>
              </div>
              <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Required)</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[100px]"
                    placeholder="Provide a reason for approval/rejection..."
                    value={adminComment}
                    onChange={e => setAdminComment(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="submit" className="btn-primary flex-1">Confirm {adminActionModal.status}</button>
                  <button type="button" className="btn-secondary flex-1" onClick={() => { setAdminActionModal(null); setAdminComment(''); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
