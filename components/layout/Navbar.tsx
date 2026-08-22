import Link from "next/link"
import { NavbarClient } from "./NavbarClient"
import { getCurrentUser } from "@/actions/auth"
import { getEmployeeProfile } from "@/actions/profile"

export async function Navbar() {
  const user = await getCurrentUser()
  let employeeData = null
  
  if (user?.profile?.role === 'employee') {
    const res = await getEmployeeProfile()
    employeeData = res?.profile || null
  }

  const currentUser = user ? {
    id: user.auth.id,
    email: user.auth.email,
    role: user.profile.role,
    name: employeeData?.full_name || user.profile.companies?.name || user.auth.email,
  } : null

  return (
    <NavbarClient currentUser={currentUser} />
  )
}
