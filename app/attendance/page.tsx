"use client"

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useGlobalStore } from "@/lib/store/GlobalStore"

export default function Attendance() {
  const store = useGlobalStore();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'daily' | 'weekly'>('daily');

  if (!store?.isHydrated || !store?.currentUser) return null;

  const isAdmin = store.currentUser.role === 'admin';
  const myEmpId = store.currentUser.empId;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (viewType === 'weekly' ? 7 : 1));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (viewType === 'weekly' ? 7 : 1));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Helper to get start and end of week (Monday to Sunday)
  const getWeekRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay() || 7; // Get current day number, converting Sun(0) to 7
    if (day !== 1) d.setHours(-24 * (day - 1)); // Set to Monday
    const start = new Date(d);
    d.setDate(d.getDate() + 6); // Set to Sunday
    const end = new Date(d);
    return { start, end };
  };

  // Calculate the dates to display
  let datesToDisplay: string[] = [selectedDate];
  if (viewType === 'weekly') {
    const { start } = getWeekRange(selectedDate);
    datesToDisplay = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      datesToDisplay.push(d.toISOString().split('T')[0]);
    }
  }

  // Determine which employees to show
  let targetEmployees = store.employees;
  if (!isAdmin && myEmpId) {
    targetEmployees = store.employees.filter(e => e.id === myEmpId);
  }
  
  if (isAdmin && searchQuery) {
    targetEmployees = targetEmployees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  // Format date for display
  const formatDateDisplay = () => {
    if (viewType === 'daily') {
      return new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      const { start, end } = getWeekRange(selectedDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  // Function to resolve status for a specific date and employee
  const resolveStatus = (empId: string, dateStr: string) => {
    const record = store.attendance.find(a => a.empId === empId && a.date === dateStr);
    const timeOff = store.timeOffRequests.find(t => t.empId === empId && t.status === 'Approved' && dateStr >= t.startDate && dateStr <= t.endDate);
    
    if (timeOff) return 'leave';
    if (record) return record.status; // 'present' or 'half-day' based on store logic
    
    // If date is today and they haven't checked in yet, it's pending/absent
    const today = new Date().toISOString().split('T')[0];
    if (dateStr > today) return 'Upcoming';
    
    return 'absent';
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">Attendance</h1>
            <p className="mt-1 font-medium text-gray-500">
              {isAdmin ? "Track employee daily logs and work hours." : "View your attendance logs and work hours."}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {isAdmin && (
              <input 
                type="text" 
                placeholder="Search employee..." 
                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-auto"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            )}
            
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewType === 'daily' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setViewType('daily')}
              >
                Daily
              </button>
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewType === 'weekly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setViewType('weekly')}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" onClick={handlePrevDay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="font-bold text-gray-900 text-lg">
              {formatDateDisplay()}
            </div>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" onClick={handleNextDay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Employee</th>
                  {viewType === 'weekly' ? (
                    datesToDisplay.map(d => (
                      <th key={d} className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">
                        {new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                      </th>
                    ))
                  ) : (
                    <>
                      <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Check In</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Check Out</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Work Hours</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {targetEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.role}</div>
                    </td>
                    
                    {viewType === 'weekly' ? (
                      datesToDisplay.map(d => {
                        const status = resolveStatus(emp.id, d);
                        return (
                          <td key={d} className="p-4 text-center">
                            <span className={`inline-block w-3 h-3 rounded-full 
                              ${status === 'present' ? 'bg-emerald-500' : ''}
                              ${status === 'absent' ? 'bg-rose-500' : ''}
                              ${status === 'leave' ? 'bg-amber-500' : ''}
                              ${status === 'half-day' ? 'bg-sky-500' : ''}
                              ${status === 'Upcoming' ? 'bg-gray-300' : ''}
                            `} title={status} />
                          </td>
                        )
                      })
                    ) : (
                      <>
                        {(() => {
                          const status = resolveStatus(emp.id, selectedDate);
                          const record = store.attendance.find(a => a.empId === emp.id && a.date === selectedDate);
                          return (
                            <>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                  ${status === 'present' ? 'bg-emerald-100 text-emerald-700' : ''}
                                  ${status === 'absent' ? 'bg-rose-100 text-rose-700' : ''}
                                  ${status === 'leave' ? 'bg-amber-100 text-amber-700' : ''}
                                  ${status === 'half-day' ? 'bg-sky-100 text-sky-700' : ''}
                                  ${status === 'Upcoming' ? 'bg-gray-100 text-gray-600' : ''}
                                `}>
                                  {status.replace('-', ' ')}
                                </span>
                              </td>
                              <td className="p-4 font-medium text-gray-900">{record?.checkIn || '—'}</td>
                              <td className="p-4 font-medium text-gray-900">{record?.checkOut || '—'}</td>
                              <td className="p-4 font-medium text-gray-900">{record?.workHours || '—'}</td>
                            </>
                          )
                        })()}
                      </>
                    )}
                  </tr>
                ))}
                {targetEmployees.length === 0 && (
                  <tr>
                    <td colSpan={viewType === 'weekly' ? 8 : 5} className="p-8 text-center text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {viewType === 'weekly' && (
          <div className="flex gap-4 items-center justify-center text-sm font-medium text-gray-600 bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Absent</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-sky-500"></div> Half-day</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Leave</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
