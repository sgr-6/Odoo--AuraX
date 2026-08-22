"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useGlobalStore } from "@/lib/store/GlobalStore"

export default function EmployeeDashboard() {
  const store = useGlobalStore();
  const router = useRouter();

  if (!store?.isHydrated || !store?.currentUser) return null;

  const employee = store.employees.find(e => e.id === store.currentUser?.empId);
  if (!employee) return <DashboardLayout><div className="p-8 text-center text-gray-500">Employee profile not linked.</div></DashboardLayout>;

  const recentActivities = store.activities.filter(a => a.empId === employee.id).slice(0, 5);

  const handleLogout = () => {
    store.logout();
    router.push('/login');
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">Welcome back, {employee.name.split(' ')[0]}!</h1>
          <p className="mt-1 font-medium text-gray-500">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/profile/${employee.id}`} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="font-bold text-gray-900">My Profile</h3>
            <p className="text-xs text-gray-500 mt-2">View and update your info</p>
          </Link>
          
          <Link href="/attendance" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:indigo-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              📅
            </div>
            <h3 className="font-bold text-gray-900">Attendance</h3>
            <p className="text-xs text-gray-500 mt-2">View daily & weekly logs</p>
          </Link>

          <Link href="/time-off" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:amber-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              ⛱️
            </div>
            <h3 className="font-bold text-gray-900">Leave Requests</h3>
            <p className="text-xs text-gray-500 mt-2">Apply & track time off</p>
          </Link>

          <div onClick={handleLogout} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:rose-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              🚪
            </div>
            <h3 className="font-bold text-gray-900">Log Out</h3>
            <p className="text-xs text-gray-500 mt-2">Securely sign out</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {recentActivities.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recentActivities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-4 items-start">
                    <div className="mt-1 relative flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full z-10"></div>
                      {idx !== recentActivities.length - 1 && (
                        <div className="absolute top-2 bottom-[-16px] left-1/2 w-px bg-gray-200 -translate-x-1/2"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity to show.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
