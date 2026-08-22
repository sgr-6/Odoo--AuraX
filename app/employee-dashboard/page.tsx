import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { getCurrentUser } from '@/actions/auth'
import { getEmployeeProfile } from '@/actions/profile'
import { LogoutButton } from './LogoutButton';

export default async function EmployeeDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { profile } = await getEmployeeProfile();
  if (!profile) {
    return <DashboardLayout><div className="p-8 text-center text-gray-500">Employee profile not linked.</div></DashboardLayout>;
  }

  const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'User';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">Welcome back, {firstName}!</h1>
          <p className="mt-1 font-medium text-gray-500">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/my-profile`} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="font-bold text-gray-900">My Profile</h3>
            <p className="text-xs text-gray-500 mt-2">View and update your info</p>
          </Link>
          
          <Link href="/attendance" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              📅
            </div>
            <h3 className="font-bold text-gray-900">Attendance</h3>
            <p className="text-xs text-gray-500 mt-2">View daily & weekly logs</p>
          </Link>

          <Link href="/time-off" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
              ⛱️
            </div>
            <h3 className="font-bold text-gray-900">Leave Requests</h3>
            <p className="text-xs text-gray-500 mt-2">Apply & track time off</p>
          </Link>

          <LogoutButton />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              No recent activity to show.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
