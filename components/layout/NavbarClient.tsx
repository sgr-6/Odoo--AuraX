"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/auth"

export function NavbarClient({ currentUser }: { currentUser: any }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide text-gray-900 no-underline">
          <div className="w-3.5 h-3.5 bg-indigo-600 rounded-sm" />
          DAYFLOW
        </Link>
        <nav className="hidden md:flex gap-6">
          {currentUser?.role === 'admin' ? (
            <>
              <Link 
                href="/dashboard" 
                className={`nav-btn ${pathname === '/dashboard' || pathname === '/' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/attendance" 
                className={`nav-btn ${pathname === '/attendance' ? 'active' : ''}`}
              >
                Attendance
              </Link>
              <Link 
                href="/time-off" 
                className={`nav-btn ${pathname === '/time-off' ? 'active' : ''}`}
              >
                Time Off
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/employee-dashboard" 
                className={`nav-btn ${pathname === '/employee-dashboard' || pathname === '/' ? 'active' : ''}`}
              >
                My Dashboard
              </Link>
              <Link 
                href="/attendance" 
                className={`nav-btn ${pathname === '/attendance' ? 'active' : ''}`}
              >
                My Attendance
              </Link>
              <Link 
                href="/time-off" 
                className={`nav-btn ${pathname === '/time-off' ? 'active' : ''}`}
              >
                My Leave Requests
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 border border-gray-200 cursor-pointer hover:border-indigo-600 transition-all duration-200">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                {currentUser?.name?.charAt(0).toUpperCase() || 'E'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 p-2">
            <DropdownMenuLabel className="font-bold text-gray-900 px-2 py-1.5">
              {currentUser?.name || 'User'}
              <div className="text-xs font-normal text-gray-500 mt-0.5">{currentUser?.email || ''}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100 my-1" />
            <DropdownMenuItem 
              className="cursor-pointer text-gray-700 focus:bg-gray-50 focus:text-indigo-600 rounded-md px-2 py-1.5"
              onClick={() => router.push('/my-profile')}
            >
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-gray-700 focus:bg-gray-50 focus:text-indigo-600 rounded-md px-2 py-1.5"
              onClick={handleLogout}
            >
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
