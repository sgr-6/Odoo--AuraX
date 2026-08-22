"use client"

import React, { useState } from 'react';
import { createLeaveRequest, approveLeave, rejectLeave } from '@/actions/leave';

export function LeaveClient({ isAdmin, initialBalances, initialRequests }: any) {
  const [requests, setRequests] = useState(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    remarks: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const form = new FormData();
    form.append('leaveType', formData.leaveType);
    form.append('startDate', formData.startDate);
    form.append('endDate', formData.endDate);
    form.append('remarks', formData.remarks);
    if (attachment) {
      form.append('attachment', attachment);
    }
    
    const res = await createLeaveRequest(form);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleApprove = async (id: string) => {
    await approveLeave(id);
    window.location.reload();
  };

  const handleReject = async (id: string) => {
    await rejectLeave(id);
    window.location.reload();
  };

  const getBalance = (type: string) => {
    const bal = initialBalances.find((b: any) => b.leave_type === type);
    if (!bal) return 0;
    return bal.allocated_days - bal.used_days;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">Time Off</h1>
          <p className="mt-1 font-medium text-gray-500">
            {isAdmin ? "Manage employee leave requests." : "Manage your time off requests."}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            NEW REQUEST
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
            <div className="text-sm font-medium text-indigo-800 uppercase tracking-wide mb-2">Paid Time Off</div>
            <div className="text-3xl font-bold text-indigo-900">{getBalance('paid')} Days</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
            <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide mb-2">Sick Time Off</div>
            <div className="text-3xl font-bold text-emerald-900">{getBalance('sick')} Days</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <div className="text-sm font-medium text-amber-800 uppercase tracking-wide mb-2">Unpaid Time Off</div>
            <div className="text-3xl font-bold text-amber-900">∞</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Leave Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {isAdmin && <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Employee</th>}
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Type</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Duration</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Days</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                {isAdmin && <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  {isAdmin && (
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{req.employees?.full_name}</div>
                      <div className="text-sm text-gray-500">{req.employees?.department}</div>
                    </td>
                  )}
                  <td className="p-4 font-medium text-gray-900 capitalize">{req.leave_type}</td>
                  <td className="p-4 text-gray-600">{req.start_date} to {req.end_date}</td>
                  <td className="p-4 font-medium text-gray-900">
                    {Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : ''}
                      ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    `}>
                      {req.status}
                    </span>
                    {req.attachment_url && (
                      <a href={`/storage/v1/object/public/leave-attachments/${req.attachment_url}`} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-indigo-600 hover:underline">
                        View Attachment
                      </a>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-4">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(req.id)} className="px-3 py-1 bg-emerald-500 text-white rounded text-sm font-medium hover:bg-emerald-600">Approve</button>
                          <button onClick={() => handleReject(req.id)} className="px-3 py-1 bg-rose-500 text-white rounded text-sm font-medium hover:bg-rose-600">Reject</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} className="p-8 text-center text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Leave Request</h2>
            {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</div>}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time off Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  value={formData.leaveType}
                  onChange={e => setFormData({...formData, leaveType: e.target.value})}
                >
                  <option value="paid">Paid Time Off</option>
                  <option value="sick">Sick Time Off</option>
                  <option value="unpaid">Unpaid Time Off</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocation: {calculateDays()} Days</label>
              </div>

              {formData.leaveType === 'sick' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Certificate (Required for Sick Leave)</label>
                  <input 
                    type="file" 
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setAttachment(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                  rows={3}
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
