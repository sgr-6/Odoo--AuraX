"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/actions/auth';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div onClick={handleLogout} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer no-underline group flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform">
        🚪
      </div>
      <h3 className="font-bold text-gray-900">Log Out</h3>
      <p className="text-xs text-gray-500 mt-2">Securely sign out</p>
    </div>
  );
}
