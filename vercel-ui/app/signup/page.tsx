"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { signupAction } from "@/app/actions/auth-service"
import { Upload } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [signupStep, setSignupStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    address: "",
    phone: "",
    logo_url: ""
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (signupStep === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.company_name || !formData.phone) {
        toast.error("Please fill in all required fields")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }
    }
    if (signupStep < 2) {
      setSignupStep(signupStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // In a real app, we'd upload the logoFile and get a URL. 
      // For now, we'll just send the payload.
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        address: formData.address,
        phone: formData.phone,
        logo_url: formData.logo_url
      }

      const res = await signupAction(payload)
      if (res.success) {
        toast.success("Account created successfully!", {
          description: "Welcome to Solar Permit Portal. Redirecting to login...",
        })
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        toast.error(res.error || "Signup failed")
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
          <div className="flex justify-center mb-8 px-4">
             <Button variant="ghost" className="absolute left-0 top-0 mt-4 ml-4" onClick={() => router.push("/login")}>
                &larr; Back to Login
             </Button>
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
              <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
              <CardDescription className="text-base">Register your contracting business</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <AnimatePresence mode="wait">
                  {signupStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-full bg-primary rounded-full" />
                        <div className="h-1.5 w-full bg-muted rounded-full" />
                      </div>
                      <div className="text-sm font-bold text-primary tracking-wide uppercase">Step 1: Account Information</div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullname">Full Name *</Label>
                          <Input 
                            id="fullname" 
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="John Doe" 
                            required 
                            className="h-11 rounded-xl bg-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company *</Label>
                          <Input 
                            id="company" 
                            value={formData.company_name}
                            onChange={(e) => updateField("company_name", e.target.value)}
                            placeholder="Solar Solutions Inc." 
                            required 
                            className="h-11 rounded-xl bg-white" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="you@company.com" 
                            required 
                            className="h-11 rounded-xl bg-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input 
                            id="phone" 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="(555) 123-4567" 
                            required 
                            className="h-11 rounded-xl bg-white" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={formData.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            required 
                            className="h-11 rounded-xl bg-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm *</Label>
                          <Input 
                            id="confirm-password" 
                            type="password" 
                            value={formData.confirmPassword}
                            onChange={(e) => updateField("confirmPassword", e.target.value)}
                            required 
                            className="h-11 rounded-xl bg-white" 
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20 mt-4"
                      >
                        Continue
                      </Button>
                    </motion.div>
                  )}

                  {signupStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-full bg-primary rounded-full" />
                        <div className="h-1.5 w-full bg-primary rounded-full" />
                      </div>
                      <div className="text-sm font-bold text-primary tracking-wide uppercase">Step 2: Business Details</div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          placeholder="123 Main St, City, State 12345"
                          rows={4}
                          className="rounded-xl bg-white resize-none pt-3"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Company Logo (Optional)</Label>
                        <div
                          className="group relative border-2 border-dashed border-zinc-200 bg-white rounded-2xl p-8 text-center transition-all hover:border-primary/50 hover:bg-zinc-50 cursor-pointer overflow-hidden"
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
                          className="flex-1 h-12 rounded-xl font-bold bg-white border-zinc-200"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
