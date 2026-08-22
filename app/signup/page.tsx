"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/lib/store/GlobalStore';

export default function SignUpPage() {
  const router = useRouter();
  const store = useGlobalStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee'
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [showVerify, setShowVerify] = useState(false);

  if (!store?.isHydrated) return null;

  const validatePassword = (pwd: string) => {
    const errs = [];
    if (pwd.length < 8) errs.push('Minimum 8 characters');
    if (!/[A-Z]/.test(pwd)) errs.push('At least one uppercase letter');
    if (!/[0-9]/.test(pwd)) errs.push('At least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errs.push('At least one special character');
    return errs;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if email already exists
    if (store.accounts.some(a => a.email === formData.email)) {
      setErrors(['An account with this email already exists.']);
      return;
    }
    
    const pwdErrors = validatePassword(formData.password);
    if (pwdErrors.length > 0) {
      setErrors(pwdErrors);
      return;
    }
    
    setErrors([]);
    
    // Create account (unverified)
    store.registerAccount({
      email: formData.email,
      passwordHash: formData.password, // simulating hash for demo
      role: formData.role
    });
    
    // Show check email screen
    setShowVerify(true);
  };

  const handleSimulateVerify = () => {
    store.verifyAccount(formData.email);
    router.push('/login');
  };

  if (showVerify) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-wide text-gray-900">
              <div className="w-4 h-4 bg-indigo-600 rounded-sm" />
              DAYFLOW
            </div>
          </div>
          <div className="bg-white py-10 px-6 shadow-sm rounded-xl sm:px-10 border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-500 mb-8">
              We've sent a verification link to <strong>{formData.email}</strong>. Please verify your email before logging in.
            </p>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 text-sm text-indigo-700">
              <em>(Demo Mode)</em> Click the button below to simulate verifying your email instantly.
            </div>
            <button
              onClick={handleSimulateVerify}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Simulate Verification & Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-wide text-gray-900">
            <div className="w-4 h-4 bg-indigo-600 rounded-sm" />
            DAYFLOW
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Onboard New User
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Admin portal for provisioning employee accounts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Temporary Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  <ul className="list-disc pl-5">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Role
              </label>
              <div className="mt-1">
                <select
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin / HR</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
