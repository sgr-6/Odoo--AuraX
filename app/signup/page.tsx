"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Building2, User } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Mock API call to signUpCompany()
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <Card className="w-full max-w-2xl relative z-10 border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            Register your Company
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Create an Admin account to get started with Dayflow
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-8">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
                {error}
              </div>
            )}
            
            {/* Company Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary pb-2 border-b border-border">
                <Building2 className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Company Details</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-zinc-300">Company Name</Label>
                  <Input id="companyName" required className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-zinc-300">Company Logo (Optional)</Label>
                  <Input id="logo" type="file" accept="image/*" className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-primary h-11 cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 hover:file:bg-primary/20" />
                </div>
              </div>
            </div>

            {/* Admin Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary pb-2 border-b border-border">
                <User className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Admin Account</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
                  <Input id="fullName" required className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                  <Input id="phone" type="tel" required className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Work Email</Label>
                  <Input id="email" type="email" required className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-primary h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <Input id="password" type="password" required className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-primary h-11" />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button 
              type="submit" 
              className="w-full h-11 font-medium bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating company...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
            <div className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline hover:text-primary/90 font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
