"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Upload, Plus, Trash2 } from "lucide-react"

type License = {
  id: string
  number: string
  type: string
  state: string
}

export default function LandingPage() {
  const router = useRouter()
  const [signupStep, setSignupStep] = useState(1)
  const [licenses, setLicenses] = useState<License[]>([{ id: "1", number: "", type: "", state: "" }])
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const addLicense = () => {
    setLicenses([
      ...licenses,
      {
        id: Date.now().toString(),
        number: "",
        type: "",
        state: "",
      },
    ])
  }

  const removeLicense = (id: string) => {
    if (licenses.length > 1) {
      setLicenses(licenses.filter((l) => l.id !== id))
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Login successful", {
      description: "Redirecting to your dashboard...",
    })
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  const handleNextStep = () => {
    if (signupStep < 3) {
      setSignupStep(signupStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1)
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Account created!", {
      description: "Welcome to Solar Permit Portal. Redirecting...",
    })
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FAA93E]/5 via-[#EBE5DA] to-[#E76549]/10 flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col space-y-8 animate-fade-in-up">
          <div className="flex justify-start">
            <Image 
              src="/logo.png" 
              alt="Solar Permit Portal" 
              width={200} 
              height={80} 
              className="h-16 w-auto drop-shadow-sm hover:scale-105 transition-transform duration-300" 
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-[1.1]" style={{ color: "oklch(0.75 0.14 35)" }}>
              Streamline Your <span className="text-foreground">Solar Permits</span>
            </h1>
            <p className="text-xl text-muted-foreground/80 font-medium max-w-md">
              The modern platform for solar contractors to manage permits, documentation, and compliance—all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-4">
            {[
              { label: "Permits Processed", value: "500+", delay: "0.1s" },
              { label: "Approval Rate", value: "98%", delay: "0.2s" },
              { label: "Avg. Turnaround", value: "24hr", delay: "0.3s" }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: stat.delay }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: "oklch(0.75 0.14 35)" }}>
                  {stat.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Decorative background blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

          <Card className="backdrop-blur-xl bg-card/70 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-white/40 overflow-hidden rounded-3xl">
            <div className="lg:hidden p-6 pb-0 flex justify-center">
              <Image src="/logo.png" alt="Logo" width={140} height={50} className="h-10 w-auto" />
            </div>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome</CardTitle>
              <CardDescription className="text-base">Sign in or create your account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-8">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm" onClick={() => setSignupStep(1)}>
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg data-[state=active]:shadow-sm">Create Account</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        className="h-11 rounded-xl bg-white/50 border-white/50 focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="px-0 h-auto text-sm font-semibold hover:no-underline" style={{ color: "oklch(0.75 0.14 35)" }}>
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
                              <Button className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" style={{ backgroundColor: "oklch(0.75 0.14 35)" }}>
                                Send Reset Link
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        className="h-11 rounded-xl bg-white/50 border-white/50 focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" style={{ backgroundColor: "oklch(0.75 0.14 35)" }}>
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab - Multi-Step */}
                <TabsContent value="signup" className="mt-2 min-h-[450px]">
                  <form onSubmit={handleSignup}>
                    <AnimatePresence mode="wait">
                      {/* Step 1: Account */}
                      {signupStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-5"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-full bg-primary rounded-full" />
                            <div className="h-1 w-full bg-muted rounded-full" />
                            <div className="h-1 w-full bg-muted rounded-full" />
                          </div>
                          <div className="text-sm font-bold text-primary tracking-wide uppercase">Step 1: Account Information</div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullname">Full Name *</Label>
                              <Input id="fullname" placeholder="John Doe" required className="h-11 rounded-xl bg-white/50" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company">Company *</Label>
                              <Input id="company" placeholder="Solar Solutions Inc." required className="h-11 rounded-xl bg-white/50" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" type="email" placeholder="you@company.com" required className="h-11 rounded-xl bg-white/50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input id="phone" type="tel" placeholder="(555) 123-4567" required className="h-11 rounded-xl bg-white/50" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Password *</Label>
                              <Input id="password" type="password" required className="h-11 rounded-xl bg-white/50" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm *</Label>
                              <Input id="confirm-password" type="password" required className="h-11 rounded-xl bg-white/50" />
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20 mt-4"
                            style={{ backgroundColor: "oklch(0.75 0.14 35)" }}
                          >
                            Continue
                          </Button>
                        </motion.div>
                      )}

                      {/* Step 2: Business */}
                      {signupStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-5"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-full bg-primary rounded-full" />
                            <div className="h-1 w-full bg-primary rounded-full" />
                            <div className="h-1 w-full bg-muted rounded-full" />
                          </div>
                          <div className="text-sm font-bold text-primary tracking-wide uppercase">Step 2: Business Information</div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="address">Business Address</Label>
                            <Textarea
                              id="address"
                              placeholder="123 Main St&#10;Suite 100&#10;City, State 12345"
                              rows={4}
                              className="rounded-xl bg-white/50 resize-none pt-3"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Company Logo</Label>
                            <div
                              onDrop={handleDrop}
                              onDragOver={(e) => e.preventDefault()}
                              className="group relative border-2 border-dashed border-white/60 bg-white/30 rounded-2xl p-8 text-center transition-all hover:border-primary/50 hover:bg-white/50 cursor-pointer overflow-hidden"
                            >
                              <Upload className="mx-auto h-10 w-10 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                              <p className="mt-3 text-sm font-medium text-muted-foreground">
                                {logoFile ? (
                                  <span className="text-primary font-bold">{logoFile.name}</span>
                                ) : (
                                  "Drag & drop logo or browse files"
                                )}
                              </p>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="logo-upload"
                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                              />
                              <Label htmlFor="logo-upload" className="absolute inset-0 cursor-pointer opacity-0" />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePreviousStep}
                              className="flex-1 h-12 rounded-xl font-bold bg-white/20 border-white/40"
                            >
                              Back
                            </Button>
                            <Button
                              type="button"
                              onClick={handleNextStep}
                              className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                              style={{ backgroundColor: "oklch(0.75 0.14 35)" }}
                            >
                              Continue
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: License Information */}
                      {signupStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-5"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-full bg-primary rounded-full" />
                            <div className="h-1 w-full bg-primary rounded-full" />
                            <div className="h-1 w-full bg-primary rounded-full" />
                          </div>
                          <div className="text-sm font-bold text-primary tracking-wide uppercase">Step 3: License Information</div>
                          
                          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-none">
                            {licenses.map((license, index) => (
                              <div key={license.id} className="p-5 border border-white/50 rounded-2xl space-y-4 bg-white/40 shadow-sm relative group">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold opacity-60">License {index + 1}</span>
                                  {licenses.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeLicense(license.id)}
                                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`license-number-${license.id}`}>License Number</Label>
                                  <Input id={`license-number-${license.id}`} placeholder="ABC123456" required className="h-10 rounded-lg bg-white/70" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`license-type-${license.id}`}>Type</Label>
                                    <Select required>
                                      <SelectTrigger id={`license-type-${license.id}`} className="h-10 rounded-lg bg-white/70">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl border-white/40">
                                        <SelectItem value="electrical">Electrical</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="solar">Solar</SelectItem>
                                        <SelectItem value="roofing">Roofing</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`license-state-${license.id}`}>State</Label>
                                    <Select required>
                                      <SelectTrigger id={`license-state-${license.id}`} className="h-10 rounded-lg bg-white/70">
                                        <SelectValue placeholder="State" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl border-white/40">
                                        <SelectItem value="CA">California</SelectItem>
                                        <SelectItem value="TX">Texas</SelectItem>
                                        <SelectItem value="FL">Florida</SelectItem>
                                        <SelectItem value="AZ">Arizona</SelectItem>
                                        <SelectItem value="NV">Nevada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addLicense}
                            className="w-full h-11 border-dashed border-2 rounded-xl bg-white/20 hover:bg-white/40 font-bold tracking-wide"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another License
                          </Button>
                          
                          <div className="flex gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePreviousStep}
                              className="flex-1 h-12 rounded-xl font-bold bg-white/20 border-white/40"
                            >
                              Back
                            </Button>
                            <Button type="submit" className="flex-1 h-12 rounded-xl font-bold shadow-xl shadow-primary/30" style={{ backgroundColor: "oklch(0.75 0.14 35)" }}>
                              Create Account
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground/60 mt-8 font-medium">
            &copy; {new Date().getFullYear()} SunPermit Portal. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
