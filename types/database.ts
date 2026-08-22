export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          login_id: string
          email: string
          role: 'admin' | 'employee'
          must_change_password: boolean
          created_at: string
        }
        Insert: {
          id: string
          company_id: string
          login_id: string
          email: string
          role: 'admin' | 'employee'
          must_change_password?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          login_id?: string
          email?: string
          role?: 'admin' | 'employee'
          must_change_password?: boolean
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          company_id: string
          full_name: string
          phone: string | null
          address: string | null
          avatar_url: string | null
          job_title: string | null
          department: string | null
          date_of_joining: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          full_name: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          job_title?: string | null
          department?: string | null
          date_of_joining: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          full_name?: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          job_title?: string | null
          department?: string | null
          date_of_joining?: string
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          company_id: string
          date: string
          check_in: string | null
          check_out: string | null
          status: 'present' | 'absent' | 'half-day' | 'leave' | null
          work_hours: number | null
          extra_hours: number | null
        }
        Insert: {
          id?: string
          employee_id: string
          company_id: string
          date: string
          check_in?: string | null
          check_out?: string | null
          status?: 'present' | 'absent' | 'half-day' | 'leave' | null
          work_hours?: number | null
          extra_hours?: number | null
        }
        Update: {
          id?: string
          employee_id?: string
          company_id?: string
          date?: string
          check_in?: string | null
          check_out?: string | null
          status?: 'present' | 'absent' | 'half-day' | 'leave' | null
          work_hours?: number | null
          extra_hours?: number | null
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          company_id: string
          leave_type: 'paid' | 'sick' | 'unpaid' | null
          start_date: string
          end_date: string
          remarks: string | null
          attachment_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          company_id: string
          leave_type?: 'paid' | 'sick' | 'unpaid' | null
          start_date: string
          end_date: string
          remarks?: string | null
          attachment_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          company_id?: string
          leave_type?: 'paid' | 'sick' | 'unpaid' | null
          start_date?: string
          end_date?: string
          remarks?: string | null
          attachment_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          created_at?: string
        }
      }
      leave_balances: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'paid' | 'sick' | 'unpaid' | null
          allocated_days: number
          used_days: number
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type?: 'paid' | 'sick' | 'unpaid' | null
          allocated_days?: number
          used_days?: number
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: 'paid' | 'sick' | 'unpaid' | null
          allocated_days?: number
          used_days?: number
        }
      }
      salary_structures: {
        Row: {
          id: string
          employee_id: string
          company_id: string
          monthly_wage: number
          basic: number | null
          hra: number | null
          standard_allowance: number | null
          performance_bonus: number | null
          travel_allowance: number | null
          fixed_allowance: number | null
          pf_rate: number | null
          professional_tax: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          company_id: string
          monthly_wage?: number
          basic?: number | null
          hra?: number | null
          standard_allowance?: number | null
          performance_bonus?: number | null
          travel_allowance?: number | null
          fixed_allowance?: number | null
          pf_rate?: number | null
          professional_tax?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          company_id?: string
          monthly_wage?: number
          basic?: number | null
          hra?: number | null
          standard_allowance?: number | null
          performance_bonus?: number | null
          travel_allowance?: number | null
          fixed_allowance?: number | null
          pf_rate?: number | null
          professional_tax?: number | null
          updated_at?: string
        }
      }
    }
  }
}
