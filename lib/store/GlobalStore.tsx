"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type UserRole = "admin" | "employee"

export type UserAccount = {
  id: string
  empId?: string
  email: string
  passwordHash: string // Simulate hash
  role: UserRole
  isVerified: boolean
}

export type EmployeeSalary = {
  basic: number
  hra: number
  allowances: number
}

export type EmployeeDocument = {
  id: string
  name: string
  url: string
}

export type Employee = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  department: string
  joinedAt: string
  status: "present" | "absent" | "leave" | "half-day"
  address?: string
  avatarFallback?: string
  salary?: EmployeeSalary
  documents?: EmployeeDocument[]
}

export type AttendanceRecord = {
  id: string
  empId: string
  date: string // YYYY-MM-DD
  checkIn: string // HH:mm AM/PM
  checkOut: string | null
  workHours: string | null
  status: "present" | "absent" | "leave" | "half-day"
}

export type TimeOffRequest = {
  id: string
  empId: string
  type: string
  startDate: string
  endDate: string
  remarks?: string
  adminComment?: string
  status: "Pending" | "Approved" | "Rejected"
  attachment?: string
}

export type ActivityLog = {
  id: string
  empId: string
  message: string
  timestamp: string
}

type GlobalState = {
  currentUser: UserAccount | null
  accounts: UserAccount[]
  employees: Employee[]
  attendance: AttendanceRecord[]
  timeOffRequests: TimeOffRequest[]
  activities: ActivityLog[]
  isHydrated: boolean
}

type GlobalActions = {
  login: (user: UserAccount) => void
  logout: () => void
  registerAccount: (account: Omit<UserAccount, "id" | "isVerified">) => void
  verifyAccount: (email: string) => void
  updateProfile: (empId: string, updates: Partial<Employee>) => void
  updateSalary: (empId: string, salary: EmployeeSalary) => void
  addEmployee: (emp: Omit<Employee, "id" | "status">) => void
  checkIn: (empId: string) => void
  checkOut: (empId: string) => void
  requestTimeOff: (req: Omit<TimeOffRequest, "id" | "status">) => void
  updateTimeOffStatus: (id: string, status: "Approved" | "Rejected", adminComment?: string) => void
  logActivity: (empId: string, message: string) => void
}

const GlobalContext = createContext<(GlobalState & GlobalActions) | undefined>(undefined)

const defaultAccounts: UserAccount[] = [
  { id: "acc1", email: "hradmin@gmail.com", passwordHash: "Hradmin@dayflow", role: "admin", isVerified: true, empId: "1" },
  { id: "acc2", email: "employee@dayflow.demo", passwordHash: "Emp@1234", role: "employee", isVerified: true, empId: "2" },
]

const defaultEmployees: Employee[] = [
  { id: "1", name: "HR Admin", role: "HR Manager", email: "hradmin@gmail.com", phone: "555-0000", department: "HR", joinedAt: "2023-01-01", status: "present", address: "123 Business Rd", salary: { basic: 50, hra: 30, allowances: 20 } },
  { id: "2", name: "Alice Johnson", role: "Software Engineer", email: "alice@dayflow.demo", phone: "555-0101", department: "Engineering", joinedAt: "2023-01-15", status: "absent", address: "456 Tech Lane", salary: { basic: 60, hra: 25, allowances: 15 } },
  { id: "3", name: "Bob Smith", role: "Product Manager", email: "bob@dayflow.demo", phone: "555-0102", department: "Product", joinedAt: "2023-03-20", status: "leave" },
]

const defaultAttendance: AttendanceRecord[] = [
  { id: "a1", empId: "1", date: new Date().toISOString().split('T')[0], checkIn: "09:00 AM", checkOut: null, workHours: null, status: "present" },
]

const defaultTimeOff: TimeOffRequest[] = [
  { id: "t1", empId: "3", type: "Vacation", startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], status: "Approved" },
]

const defaultActivities: ActivityLog[] = [
  { id: "log1", empId: "1", message: "Checked in at 09:00 AM", timestamp: new Date().toISOString() }
]

export function GlobalStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalState>({
    currentUser: defaultAccounts[0],
    accounts: defaultAccounts,
    employees: defaultEmployees,
    attendance: defaultAttendance,
    timeOffRequests: defaultTimeOff,
    activities: defaultActivities,
    isHydrated: false,
  })

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("dayflow_store_v3")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState((prev) => ({ ...prev, ...parsed, isHydrated: true }))
      } catch (e) {
        console.error("Failed to parse store", e)
        setState((prev) => ({ ...prev, isHydrated: true }))
      }
    } else {
      setState((prev) => ({ ...prev, isHydrated: true }))
    }
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    if (state.isHydrated) {
      const { isHydrated, ...toSave } = state
      localStorage.setItem("dayflow_store_v3", JSON.stringify(toSave))
    }
  }, [state])

  const login = (user: UserAccount) => setState(s => ({ ...s, currentUser: user }))
  const logout = () => setState(s => ({ ...s, currentUser: null }))

  const registerAccount = (account: Omit<UserAccount, "id" | "isVerified">) => {
    setState(s => {
      const id = Math.random().toString(36).substr(2, 9)
      const empId = Math.random().toString(36).substr(2, 9)
      
      const newAcc: UserAccount = { ...account, id, isVerified: false, empId }
      const newEmp: Employee = {
        id: empId,
        name: account.email.split('@')[0], // placeholder name
        role: account.role === "admin" ? "HR" : "Employee",
        email: account.email,
        phone: "",
        department: "TBD",
        joinedAt: new Date().toISOString().split('T')[0],
        status: "absent"
      }
      return { ...s, accounts: [...s.accounts, newAcc], employees: [...s.employees, newEmp] }
    })
  }

  const verifyAccount = (email: string) => {
    setState(s => ({
      ...s,
      accounts: s.accounts.map(acc => acc.email === email ? { ...acc, isVerified: true } : acc)
    }))
  }

  const updateProfile = (empId: string, updates: Partial<Employee>) => {
    setState(s => ({
      ...s,
      employees: s.employees.map(e => e.id === empId ? { ...e, ...updates } : e)
    }))
  }

  const updateSalary = (empId: string, salary: EmployeeSalary) => {
    setState(s => ({
      ...s,
      employees: s.employees.map(e => e.id === empId ? { ...e, salary } : e)
    }))
  }

  const addEmployee = (emp: Omit<Employee, "id" | "status">) => {
    setState(s => {
      const newEmp: Employee = {
        ...emp,
        id: Math.random().toString(36).substr(2, 9),
        status: "absent"
      }
      return { ...s, employees: [...s.employees, newEmp] }
    })
  }
  
  const logActivity = (empId: string, message: string) => {
    setState(s => {
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        empId,
        message,
        timestamp: new Date().toISOString()
      }
      return { ...s, activities: [newLog, ...s.activities] }
    })
  }

  const checkIn = (empId: string) => {
    setState(s => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const dateStr = now.toISOString().split('T')[0]

      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        empId,
        date: dateStr,
        checkIn: timeStr,
        checkOut: null,
        workHours: null,
        status: "present"
      }

      const newEmployees = s.employees.map(emp => 
        emp.id === empId ? { ...emp, status: "present" as const } : emp
      )
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        empId,
        message: `Checked in at ${timeStr}`,
        timestamp: new Date().toISOString()
      }

      return { ...s, employees: newEmployees, attendance: [...s.attendance, newRecord], activities: [newLog, ...s.activities] }
    })
  }

  const checkOut = (empId: string) => {
    setState(s => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const dateStr = now.toISOString().split('T')[0]

      let workHoursNum = 8 // Default dummy
      
      const newAttendance = s.attendance.map(record => {
        if (record.empId === empId && record.date === dateStr && !record.checkOut) {
          // If less than 4 hours, mark half day
          const status = workHoursNum < 4 ? "half-day" : "present"
          return { ...record, checkOut: timeStr, workHours: `${workHoursNum}h 0m`, status }
        }
        return record
      })

      const newEmployees = s.employees.map(emp => 
        emp.id === empId ? { ...emp, status: "absent" as const } : emp
      )
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        empId,
        message: `Checked out at ${timeStr}`,
        timestamp: new Date().toISOString()
      }

      return { ...s, employees: newEmployees, attendance: newAttendance, activities: [newLog, ...s.activities] }
    })
  }

  const requestTimeOff = (req: Omit<TimeOffRequest, "id" | "status">) => {
    setState(s => {
      const newReq: TimeOffRequest = {
        ...req,
        id: Math.random().toString(36).substr(2, 9),
        status: "Pending"
      }
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        empId: req.empId,
        message: `Applied for ${req.type} time off`,
        timestamp: new Date().toISOString()
      }
      return { ...s, timeOffRequests: [...s.timeOffRequests, newReq], activities: [newLog, ...s.activities] }
    })
  }

  const updateTimeOffStatus = (id: string, status: "Approved" | "Rejected", adminComment?: string) => {
    setState(s => {
      const req = s.timeOffRequests.find(r => r.id === id)
      if (!req) return s
      
      const newReqs = s.timeOffRequests.map(r => r.id === id ? { ...r, status, adminComment } : r)
      
      let newEmployees = s.employees
      if (status === "Approved") {
        const today = new Date().toISOString().split('T')[0]
        if (today >= req.startDate && today <= req.endDate) {
          newEmployees = s.employees.map(emp => 
            emp.id === req.empId ? { ...emp, status: "leave" as const } : emp
          )
        }
      }
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        empId: req.empId,
        message: `Leave request ${status.toLowerCase()}`,
        timestamp: new Date().toISOString()
      }
      
      return { ...s, timeOffRequests: newReqs, employees: newEmployees, activities: [newLog, ...s.activities] }
    })
  }

  return (
    <GlobalContext.Provider value={{
      ...state,
      login,
      logout,
      registerAccount,
      verifyAccount,
      updateProfile,
      updateSalary,
      addEmployee,
      checkIn,
      checkOut,
      requestTimeOff,
      updateTimeOffStatus,
      logActivity
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobalStore() {
  const context = useContext(GlobalContext)
  if (context === undefined) {
    throw new Error("useGlobalStore must be used within a GlobalStoreProvider")
  }
  return context
}
