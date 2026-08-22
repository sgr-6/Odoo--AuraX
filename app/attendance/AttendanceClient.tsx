// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
"use client"

import React, { useState } from 'react';
import { checkIn, checkOut } from '@/actions/attendance';

export function AttendanceClient({ isAdmin, initialData, employeeList, currentUserId }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(initialData);

  const handleCheckIn = async () => {
    const result = await checkIn();
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  const handleCheckOut = async () => {
    const result = await checkOut();
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  const filteredAdminData = isAdmin 
    ? data.filter((row: any) => 
        row.employees?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const employeeMetrics = () => {
    if (isAdmin) return null;
    const daysPresent = data.filter((d: any) => d.status === 'present').length;
    const totalWorkingDays = 22; // Approximation for month
    const leaveCount = data.filter((d: any) => d.status === 'leave').length;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
          <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide mb-2">Days Present</div>
          <div className="text-3xl font-bold text-emerald-900">{daysPresent}</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
          <div className="text-sm font-medium text-amber-800 uppercase tracking-wide mb-2">Leave Count</div>
          <div className="text-3xl font-bold text-amber-900">{leaveCount}</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <div className="text-sm font-medium text-indigo-800 uppercase tracking-wide mb-2">Total Working Days</div>
          <div className="text-3xl font-bold text-indigo-900">{totalWorkingDays}</div>
        </div>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = !isAdmin ? data.find((d: any) => d.date === todayStr) : null;
  const hasCheckedIn = !!todayRecord;
  const hasCheckedOut = !!todayRecord?.check_out;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">Attendance</h1>
          <p className="mt-1 font-medium text-gray-500">
            {isAdmin ? "Track employee daily logs and work hours." : "View your attendance logs and work hours."}
          </p>
        </div>
        
        {!isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={handleCheckIn} 
              disabled={hasCheckedIn}
              className={`btn-primary ${hasCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {hasCheckedIn ? 'Checked In' : 'Check In'}
            </button>
            <button 
              onClick={handleCheckOut} 
              disabled={!hasCheckedIn || hasCheckedOut}
              className={`btn-secondary ${!hasCheckedIn || hasCheckedOut ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' : 'text-rose-600 border-rose-200 hover:bg-rose-50'}`}
            >
              {hasCheckedOut ? 'Checked Out' : 'Check Out'}
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-auto"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {!isAdmin && employeeMetrics()}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {isAdmin ? (
                  <>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Employee</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Check In</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Check Out</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Work Hours</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Check In</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Check Out</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Work Hours</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Extra Hours</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isAdmin ? (
                filteredAdminData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{row.employees?.full_name}</div>
                      <div className="text-sm text-gray-500">{row.employees?.job_title}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{row.date}</td>
                    <td className="p-4 font-medium text-gray-900">{new Date(row.check_in).toLocaleTimeString()}</td>
                    <td className="p-4 font-medium text-gray-900">{row.check_out ? new Date(row.check_out).toLocaleTimeString() : '—'}</td>
                    <td className="p-4 font-medium text-gray-900">{row.work_hours || '—'}</td>
                  </tr>
                ))
              ) : (
                data.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{row.date}</td>
                    <td className="p-4 font-medium text-gray-900">{new Date(row.check_in).toLocaleTimeString()}</td>
                    <td className="p-4 font-medium text-gray-900">{row.check_out ? new Date(row.check_out).toLocaleTimeString() : '—'}</td>
                    <td className="p-4 font-medium text-gray-900">{row.work_hours || '—'}</td>
                    <td className="p-4 font-medium text-gray-900">{row.extra_hours || '—'}</td>
                  </tr>
                ))
              )}
              {((isAdmin && filteredAdminData.length === 0) || (!isAdmin && data.length === 0)) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
