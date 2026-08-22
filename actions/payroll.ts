// @ts-nocheck
// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'

export async function generatePayslipData(employeeId: string, month: number, year: number) {
  const supabase = createClient()
  
  // 1. Get Employee and Salary Structure
  const { data: salary, error: salaryError } = await supabase
    .from('salary_structures')
    .select('*, employees(*)')
    .eq('employee_id', employeeId)
    .single()
    
  if (salaryError || !salary) return { error: 'Salary structure not found' }
  
  // 2. Determine Total Days in Month
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // 3. Get Attendance Records for the Month
  const startStr = `${year}-${month.toString().padStart(2, '0')}-01`
  const endStr = month === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${(month + 1).toString().padStart(2, '0')}-01`
    
  const { data: attendance } = await supabase
    .from('attendance')
    .select('status, date')
    .eq('employee_id', employeeId)
    .gte('date', startStr)
    .lt('date', endStr)
    
  // 4. Get Leave Requests for the Month (Approved)
  const { data: leaves } = await supabase
    .from('leave_requests')
    .select('leave_type, start_date, end_date')
    .eq('employee_id', employeeId)
    .eq('status', 'approved')
    .lte('start_date', endStr)
    .gte('end_date', startStr)
    
  // 5. Calculate Payable Days
  let unpaidDays = 0;
  
  // Assuming weekends are paid rest days if employee is present during week, 
  // but for simplicity let's just deduct explicitly unpaid leave or known absent days.
  
  // Count absences from attendance table
  const absentDaysCount = attendance?.filter(a => a.status === 'absent').length || 0;
  unpaidDays += absentDaysCount;
  
  // Count unpaid leave days within this month
  if (leaves) {
    for (const leave of leaves) {
      if (leave.leave_type === 'unpaid') {
        const start = new Date(Math.max(new Date(leave.start_date).getTime(), new Date(startStr).getTime()));
        const end = new Date(Math.min(new Date(leave.end_date).getTime(), new Date(endStr).getTime() - 86400000));
        
        if (start <= end) {
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          unpaidDays += days;
        }
      }
    }
  }
  
  // Assuming standard working days in month is 22 for calculation, or calculate by actual days
  // Let's deduct unpaid days from total days
  const payableDays = Math.max(0, daysInMonth - unpaidDays);
  const prorationFactor = payableDays / daysInMonth;
  
  // 6. Prorate Salary Components
  const earnings = {
    basic: Math.round(salary.basic * prorationFactor),
    hra: Math.round(salary.hra * prorationFactor),
    standardAllowance: Math.round(salary.standard_allowance * prorationFactor),
    performanceBonus: Math.round(salary.performance_bonus * prorationFactor),
    travelAllowance: Math.round(salary.travel_allowance * prorationFactor),
    fixedAllowance: Math.round(salary.fixed_allowance * prorationFactor)
  };
  
  const totalEarnings = Object.values(earnings).reduce((a, b) => a + b, 0);
  
  const deductions = {
    providentFund: Math.round(earnings.basic * (salary.pf_rate / 100)), // PF is typically % of basic
    professionalTax: salary.professional_tax || 200 // Often fixed regardless of days, or pro-rated
  };
  
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
  
  const netPay = totalEarnings - totalDeductions;
  
  return {
    success: true,
    data: {
      employeeId,
      month,
      year,
      daysInMonth,
      payableDays,
      unpaidDays,
      earnings,
      deductions,
      totals: {
        earnings: totalEarnings,
        deductions: totalDeductions,
        netPay
      }
    }
  }
}
