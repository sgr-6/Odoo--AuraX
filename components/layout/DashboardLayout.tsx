import { Navbar } from "./Navbar"

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <footer className="w-full border-t border-gray-200 bg-white py-6 mt-auto">
        <div className="container mx-auto px-8 text-sm text-gray-500 flex justify-between items-center">
          <div>DAYFLOW &copy; 2026. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
