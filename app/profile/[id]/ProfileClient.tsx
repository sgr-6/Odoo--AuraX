// @ts-nocheck
// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react';
import { updateSalary } from '@/actions/salary';

export function ProfileClient({ employee, currentUser, initialSalary }: { employee: any, currentUser: any, initialSalary: any }) {
  const [activeTab, setActiveTab] = useState<'Private Info' | 'job' | 'Salary Info' | 'Resume'>('Private Info');
  const [isEditing, setIsEditing] = useState(false);
  const [salaryError, setSalaryError] = useState('');
  
  const isAdmin = currentUser.role === 'admin';
  const isSelf = currentUser.empId === employee.id;
  const canEditAll = isAdmin;
  const canEditPersonal = isAdmin || isSelf;

  const [formData, setFormData] = useState({
    phone: employee.phone || '',
    address: employee.address || '',
    avatarFallback: employee.full_name.charAt(0),
    department: employee.department || '',
    jobTitle: employee.job_title || '',
    
    monthlyWage: initialSalary?.monthly_wage || 0,
    basic: initialSalary?.basic || 0,
    hra: initialSalary?.hra || 0,
    standardAllowance: initialSalary?.standard_allowance || 0,
    performanceBonus: initialSalary?.performance_bonus || 0,
    travelAllowance: initialSalary?.travel_allowance || 0,
    fixedAllowance: initialSalary?.fixed_allowance || 0,
  });

  // Auto-calculate components based on Wage
  useEffect(() => {
    if (activeTab === 'Salary Info' && isEditing) {
      const wage = formData.monthlyWage || 0;
      setFormData(prev => ({
        ...prev,
        basic: wage * (prev.basic / wage || 0), // if we want percentage inputs instead, let's keep inputs as percentages!
      }));
    }
  }, [formData.monthlyWage]);
  
  const [salaryPercentages, setSalaryPercentages] = useState({
    basic: (initialSalary?.basic / initialSalary?.monthly_wage * 100) || 50,
    hra: (initialSalary?.hra / initialSalary?.basic * 100) || 50,
    standard: (initialSalary?.standard_allowance / initialSalary?.monthly_wage * 100) || 10,
    performance: (initialSalary?.performance_bonus / initialSalary?.monthly_wage * 100) || 10,
    travel: (initialSalary?.travel_allowance / initialSalary?.monthly_wage * 100) || 5,
    fixed: (initialSalary?.fixed_allowance / initialSalary?.monthly_wage * 100) || 0,
  });

  useEffect(() => {
    const wage = formData.monthlyWage || 0;
    const basic = wage * (salaryPercentages.basic / 100);
    const hra = basic * (salaryPercentages.hra / 100);
    const standard = wage * (salaryPercentages.standard / 100);
    const performance = wage * (salaryPercentages.performance / 100);
    const travel = wage * (salaryPercentages.travel / 100);
    
    // Fixed allowance = remainder to make it 100% if we want, or just calculated
    // The requirement says: auto-calculate based on percentages.
    
    setFormData(prev => ({
      ...prev,
      basic,
      hra,
      standardAllowance: standard,
      performanceBonus: performance,
      travelAllowance: travel,
    }));
  }, [formData.monthlyWage, salaryPercentages]);

  const handleSave = async () => {
    if (activeTab === 'Salary Info') {
      const form = new FormData();
      form.append('monthlyWage', formData.monthlyWage.toString());
      form.append('basic', formData.basic.toString());
      form.append('hra', formData.hra.toString());
      form.append('standardAllowance', formData.standardAllowance.toString());
      form.append('performanceBonus', formData.performanceBonus.toString());
      form.append('travelAllowance', formData.travelAllowance.toString());
      form.append('fixedAllowance', formData.fixedAllowance.toString());
      
      const res = await updateSalary(employee.id, form);
      if (res.error) {
        setSalaryError(res.error);
        return;
      }
      setIsEditing(false);
      return;
    }
    // Handle other tabs saving if needed (omitted for brevity)
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
          {formData.avatarFallback}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
          <p className="text-indigo-600 font-medium">{employee.job_title || employee.users.role}</p>
          <p className="text-gray-500 text-sm mt-1">{employee.users.email}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
        {(['Private Info', 'job', ...(isAdmin ? ['Salary Info'] : []), 'Resume'] as const).map(tab => (
          <button
            key={tab}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap
              ${activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => {
              setActiveTab(tab);
              setIsEditing(false);
              setSalaryError('');
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab} Details</h2>
          {!isEditing && ((activeTab === 'Private Info' && canEditPersonal) || (activeTab === 'Salary Info' && isAdmin)) && (
            <button className="btn-secondary text-sm px-4 py-2" onClick={() => setIsEditing(true)}>
              Edit {activeTab}
            </button>
          )}
        </div>

        {activeTab === 'Private Info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
              <div className="text-gray-900 font-medium text-lg">{employee.phone || '—'}</div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Home Address</label>
              <div className="text-gray-900 font-medium text-lg">{employee.address || '—'}</div>
            </div>
          </div>
        )}

        {activeTab === 'Salary Info' && isAdmin && (
          <div>
            {salaryError && <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg">{salaryError}</div>}
            
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Wage Type (Fixed wage) ₹ / month</label>
              {isEditing ? (
                <input type="number" className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3" value={formData.monthlyWage} onChange={e => setFormData({ ...formData, monthlyWage: Number(e.target.value) })} />
              ) : (
                <div className="text-3xl font-bold text-gray-900">₹{formData.monthlyWage.toLocaleString()}</div>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Basic ({salaryPercentages.basic}% of Wage)</div>
                <div className="text-xl font-bold">₹{formData.basic.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                {isEditing && <input type="number" className="mt-2 w-full p-2 border rounded" value={salaryPercentages.basic} onChange={e => setSalaryPercentages({...salaryPercentages, basic: Number(e.target.value)})} />}
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">House Rent Allowance ({salaryPercentages.hra}% of Basic)</div>
                <div className="text-xl font-bold">₹{formData.hra.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                {isEditing && <input type="number" className="mt-2 w-full p-2 border rounded" value={salaryPercentages.hra} onChange={e => setSalaryPercentages({...salaryPercentages, hra: Number(e.target.value)})} />}
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Standard Allowance</div>
                <div className="text-xl font-bold">₹{formData.standardAllowance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Performance Bonus</div>
                <div className="text-xl font-bold">₹{formData.performanceBonus.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500">Leave Travel Allowance</div>
                <div className="text-xl font-bold">₹{formData.travelAllowance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                <div className="text-sm text-rose-800">Provident Fund (PF) (12% of Basic)</div>
                <div className="text-xl font-bold text-rose-900">-₹{(formData.basic * 0.12).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                <div className="text-sm text-rose-800">Professional Tax</div>
                <div className="text-xl font-bold text-rose-900">-₹200</div>
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'Resume' && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button className="btn-primary" onClick={handleSave}>Save Changes</button>
            <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
