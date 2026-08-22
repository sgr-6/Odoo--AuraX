import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  return (
    <header className="top-nav">
      <div className="flex items-center gap-10">
        <Link href="/" className="logo">DAYFLOW</Link>
        <nav className="nav-links hidden md:flex">
          <Link href="/dashboard" className="nav-btn active">Dashboard</Link>
          <Link href="/attendance" className="nav-btn">Attendance</Link>
          <Link href="/time-off" className="nav-btn">Time Off</Link>
        </nav>
      </div>

      <div className="flex items-center">
        <Avatar className="h-10 w-10 border-2 border-white/20 cursor-pointer hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all">
          <AvatarImage src="" alt="User" />
          <AvatarFallback className="bg-black/50 text-white font-bold backdrop-blur-sm">E</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
