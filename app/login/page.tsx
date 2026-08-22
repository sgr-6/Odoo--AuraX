"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyLoginCredentials, finalizeLogin } from '@/actions/auth';
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    email: '',
    otp: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === 'true' || params.get('registered') === 'true') {
        setIsRegistered(true);
      }
    }
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formDataObj = new FormData();
    formDataObj.append('loginId', formData.loginId);
    formDataObj.append('password', formData.password);

    const result = await verifyLoginCredentials(formDataObj);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.redirect) {
      router.push(result.redirect);
    } else {
      setFormData({ ...formData, email: result.email });
      setStep('otp');
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formDataObj = new FormData();
    formDataObj.append('loginId', formData.loginId);
    formDataObj.append('password', formData.password);
    formDataObj.append('email', formData.email);
    formDataObj.append('otp', formData.otp);

    const result = await finalizeLogin(formDataObj);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {step === 'credentials' ? 'Welcome back' : 'Two-Factor Authentication'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'credentials' 
            ? <>Don't have an account? <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-500">Register your company</Link></>
            : `We sent a 6-digit code to ${formData.email}`
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isRegistered && step === 'credentials' && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 shadow-sm text-sm">
            <h3 className="font-bold mb-1">Success!</h3>
            <p>You can now log in securely.</p>
          </div>
        )}
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200">
          {step === 'credentials' ? (
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Login ID or Email</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.loginId}
                    onChange={e => setFormData({ ...formData, loginId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? 'Verifying...' : 'Sign In'}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 text-center mb-2">
                  Enter 6-digit OTP
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-2xl tracking-[0.5em]"
                    value={formData.otp}
                    onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="------"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || formData.otp.length !== 6}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? 'Logging in...' : 'Verify and Log In'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('credentials')}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
