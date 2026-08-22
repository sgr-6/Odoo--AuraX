"use client"

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useGlobalStore } from "@/lib/store/GlobalStore"

export default function MyProfile() {
  const store = useGlobalStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (store?.currentUser) {
      setFormData({
        phone: store.currentUser.phone || '',
        address: store.currentUser.address || ''
      });
    }
  }, [store?.currentUser]);

  if (!store?.isHydrated || !store?.currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 pb-2">My Profile</h1>
          <p className="mt-1 font-medium text-gray-500">
            Manage your personal information and settings.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
              {store.currentUser.name.charAt(0)}
            </div>
            <div className="text-center md:text-left flex-1 mt-2">
              <h2 className="text-2xl font-bold text-gray-900">{store.currentUser.name}</h2>
              <p className="text-indigo-600 font-medium mb-1">{store.currentUser.role}</p>
              <p className="text-gray-500 text-sm">{store.currentUser.email}</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-secondary whitespace-nowrap self-center md:self-start mt-4 md:mt-2"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h3>
            
            {isEditing ? (
              <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-xl">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input 
                    type="tel"
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none w-full"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({...f, phone: e.target.value}))}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <textarea 
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none w-full min-h-[100px]"
                    value={formData.address}
                    onChange={e => setFormData(f => ({...f, address: e.target.value}))}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="submit" className="btn-primary">Save Changes</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Phone Number</div>
                  <div className="text-gray-900 font-medium text-lg">{store.currentUser.phone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">Address</div>
                  <div className="text-gray-900 font-medium text-lg">{store.currentUser.address || 'Not provided'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
