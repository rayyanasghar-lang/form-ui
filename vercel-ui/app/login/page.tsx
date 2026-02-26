"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { loginAction } from "@/app/actions/auth-service"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    setIsLoading(true)
    try {
      const res = await loginAction({ email, password })
      if (res.success && res.data?.contractor) {
        // Store contractor data in localStorage
        localStorage.setItem("contractor", JSON.stringify(res.data.contractor))
        
        toast.success("Login successful", {
          description: "Redirecting to your dashboard...",
        })
        setTimeout(() => {
          router.push("/projects")
        }, 1500)
      } else {
        toast.error(res.error || "Login failed")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <Image 
              src="/logo.png" 
              alt="Solar Permit Portal" 
              width={200} 
              height={80} 
              className="h-16 w-auto drop-shadow-sm" 
              priority
            />
          </div>

          <Card className="bg-card shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-border overflow-hidden rounded-3xl">
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Contractor Login</CardTitle>
              <CardDescription className="text-base">Sign in to your account to manage your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    className="h-11 rounded-xl bg-white border-zinc-200 focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="px-0 h-auto text-sm font-semibold hover:no-underline text-primary">
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px] rounded-3xl border-white/40">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Reset Password</DialogTitle>
                          <DialogDescription className="text-base pt-2">
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email Address</Label>
                            <Input id="reset-email" type="email" placeholder="you@company.com" className="h-11 rounded-xl" />
                          </div>
                          <Button className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
                            Send Reset Link
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    className="h-11 rounded-xl bg-white border-zinc-200 focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-md font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0 h-auto font-bold text-primary" onClick={() => router.push("/signup")}>
                      Sign up
                    </Button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground/60 mt-8 font-medium">
            &copy; {new Date().getFullYear()} SunPermit Portal. All rights reserved.
          </p>
        </motion.div>
      </div>
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}
