"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  User, 
  Building2, 
  ShieldCheck, 
  FileBadge, 
  ChevronLeft, 
  Camera, 
  Plus, 
  Trash2, 
  Save,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Lock,
  Check,
  Settings,
  Bell,
  Search,
  LayoutDashboard,
  CreditCard,
  Users,
  Activity,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("account")
  const [isSaving, setIsSaving] = useState(false)

  // Mock Licenses State
  const [licenses, setLicenses] = useState([
    { id: 1, type: "Electrical Engineer", state: "California", number: "EE-99201" },
    { id: 2, type: "Contractor (C-10)", state: "Arizona", number: "ROC-332145" }
  ])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Profile updated successfully")
    }, 1000)
  }

  const addLicense = () => {
    setLicenses([...licenses, { id: Date.now(), type: "", state: "", number: "" }])
  }

  const removeLicense = (id: number) => {
    setLicenses(licenses.filter(l => l.id !== id))
  }

  const navSections = [
    {
      title: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      ]
    },
    {
      title: "Settings",
      items: [
        { id: "account", label: "Account Info", icon: User },
        { id: "business", label: "Business Details", icon: Building2 },
        { id: "licenses", label: "Licenses", icon: FileBadge },
        { id: "security", label: "Security", icon: ShieldCheck },
      ]
    },
    {
      title: "Organization",
      items: [
        { id: "team", label: "Team", icon: Users },
        { id: "billing", label: "Billing", icon: CreditCard },
      ]
    }
  ]

  return (
    <div className="flex h-screen bg-zinc-50/50 overflow-hidden font-poppins selection:bg-primary/20">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 flex flex-col border-r border-zinc-200 bg-white z-40 relative">
        {/* Header */}
        <div className="p-6 h-20 flex items-center border-b border-zinc-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">Portal</span>
          </Link>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => (
                item.href ? (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all group"
                  >
                    <item.icon className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                      activeTab === item.id 
                      ? "bg-primary/5 text-primary" 
                      : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 transition-colors ${activeTab === item.id ? "text-primary" : "text-zinc-400 group-hover:text-primary"}`} />
                    {item.label}
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="active-nav-indicator"
                        className="ml-auto w-1 h-4 bg-primary rounded-full"
                      />
                    )}
                  </button>
                )
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100">
          <div className="mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-200/50 flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-zinc-200">
              <AvatarImage src="/avatar-placeholder.png" />
              <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-bold">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">John Doe</p>
              <p className="text-[10px] font-medium text-zinc-500 truncate">Administrator</p>
            </div>
            <button className="text-zinc-400 hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="px-2 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <span>v1.2.0</span>
            <span className="h-1 w-1 bg-zinc-200 rounded-full" />
            <span>Stable</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Content Header */}
        <header className="h-20 px-10 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-zinc-900">
               {navSections.flatMap(s => s.items).find(n => n.id === activeTab)?.label}
             </h2>
             <Separator orientation="vertical" className="h-4 bg-zinc-200" />
             <p className="text-sm font-medium text-zinc-400">Manage your organization and preferences</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search..." 
                className="w-40 h-9 pl-9 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white text-xs transition-all shadow-none" 
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-zinc-200 text-zinc-400 hover:text-zinc-900">
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="h-9 rounded-lg px-4 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-none transition-all active:scale-95"
              >
                {isSaving ? "Saving..." : <><Save className="mr-2 h-3.5 w-3.5" /> Save Changes</>}
              </Button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-zinc-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {activeTab === "account" && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Account Basics Card */}
                  <Card className="border-zinc-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardHeader className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/30">
                      <CardTitle className="text-lg font-bold text-zinc-900">Profile Information</CardTitle>
                      <CardDescription className="text-sm font-medium text-zinc-500">The information used to identify you across the portal.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="flex items-start gap-8">
                          <div className="shrink-0 relative group">
                             <Avatar className="h-24 w-24 border border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
                                <AvatarImage src="/avatar-placeholder.png" />
                                <AvatarFallback className="text-2xl font-bold bg-zinc-50 text-zinc-400">JD</AvatarFallback>
                             </Avatar>
                             <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-white border border-zinc-200 text-zinc-600 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-zinc-50 transition-all">
                                <Camera className="h-4 w-4" />
                                <input type="file" className="hidden" />
                             </label>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Full Name</Label>
                                <Input defaultValue="John Doe" className="h-10 rounded-lg border-zinc-200 focus:ring-primary/20 shadow-none text-sm" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Professional Title</Label>
                                <Input defaultValue="Senior Electrical Engineer" className="h-10 rounded-lg border-zinc-200 focus:ring-primary/20 shadow-none text-sm" />
                             </div>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                          <div className="space-y-2">
                             <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Email Address</Label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input type="email" defaultValue="john.doe@solarsolutions.com" className="h-10 pl-10 rounded-lg border-zinc-200 shadow-none text-sm" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Contact Number</Label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input type="tel" defaultValue="+1 (555) 123-4567" className="h-10 pl-10 rounded-lg border-zinc-200 shadow-none text-sm" />
                             </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Settings Preferences Card */}
                  <Card className="border-zinc-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardHeader className="px-8 py-5 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-base font-bold text-zinc-900 leading-none">Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-zinc-100">
                          <div className="p-6 px-8 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                             <div className="space-y-0.5">
                                <p className="text-sm font-bold text-zinc-900">Email Notifications</p>
                                <p className="text-xs font-medium text-zinc-500">Receive weekly summaries and alert emails.</p>
                             </div>
                             <div className="h-5 w-10 bg-primary/20 rounded-full relative cursor-pointer ring-1 ring-primary/30">
                                <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-primary rounded-full shadow-sm" />
                             </div>
                          </div>
                          <div className="p-6 px-8 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                             <div className="space-y-0.5">
                                <p className="text-sm font-bold text-zinc-900">Public Profile</p>
                                <p className="text-xs font-medium text-zinc-500">Allow other team members to view your license details.</p>
                             </div>
                             <div className="h-5 w-10 bg-zinc-200 rounded-full relative cursor-pointer border border-zinc-300">
                                <div className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-sm" />
                             </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "business" && (
                <div className="space-y-6">
                  <Card className="border-zinc-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardHeader className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-lg font-bold text-zinc-900">General Information</CardTitle>
                       <CardDescription className="text-sm font-medium text-zinc-500">Company branding and legal identity details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="flex items-start gap-10">
                          <div className="w-32 space-y-3 shrink-0">
                             <div className="w-full aspect-square bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center relative group cursor-pointer hover:bg-zinc-100 transition-all">
                                <Image src="/logo.png" alt="Company Logo" width={80} height={32} className="h-8 w-auto opacity-70 grayscale" />
                                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[10px] font-bold text-zinc-900 uppercase">
                                   Update
                                </div>
                             </div>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase text-center tracking-widest leading-none">Company Logo</p>
                          </div>
                          <div className="flex-1 space-y-6">
                             <div className="space-y-2">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Legal Company Name</Label>
                                <Input defaultValue="Solar Solutions Inc." className="h-10 rounded-lg border-zinc-200 shadow-none text-sm" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Main Office Address</Label>
                                <div className="relative">
                                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                   <Input defaultValue="123 Solar Way, Los Angeles, CA 90001" className="h-10 pl-10 rounded-lg border-zinc-200 shadow-none text-sm" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  <Card className="border-zinc-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardHeader className="px-8 py-5 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-base font-bold text-zinc-900 leading-none">Integration Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                       <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                          <div className="h-10 w-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center shadow-sm">
                             <Activity className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-bold text-zinc-900">API Access</p>
                             <p className="text-xs font-medium text-zinc-500">Enable programmatic access to engineering data.</p>
                          </div>
                          <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5">Configure</Button>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "licenses" && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <div>
                         <h3 className="text-lg font-bold text-zinc-900 leading-none">Professional Credentials</h3>
                         <p className="text-sm font-medium text-zinc-400 mt-1.5">Manage licenses for automated permit applications.</p>
                      </div>
                      <Button onClick={addLicense} variant="outline" className="h-9 rounded-lg px-4 border-zinc-200 text-primary hover:bg-primary/5 hover:border-primary/20 font-bold transition-all shadow-none">
                         <Plus className="mr-2 h-4 w-4" /> Add New
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      {licenses.map((license) => (
                        <Card key={license.id} className="border-zinc-200 shadow-sm rounded-xl overflow-hidden bg-white group">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 items-end relative">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-0.5">License Type</Label>
                                <Input defaultValue={license.type} className="h-9 border-zinc-200 rounded-lg text-sm bg-zinc-50/50 focus:bg-white" placeholder="e.g. Structural Engineer" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-0.5">State of Issue</Label>
                                <Input defaultValue={license.state} className="h-9 border-zinc-200 rounded-lg text-sm bg-zinc-50/50 focus:bg-white" placeholder="e.g. California" />
                              </div>
                              <div className="space-y-2 pr-10">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-0.5">License Number</Label>
                                <Input defaultValue={license.number} className="h-9 border-zinc-200 rounded-lg text-sm bg-zinc-50/50 focus:bg-white" placeholder="e.g. SE-99221" />
                              </div>
                              
                              <button 
                                onClick={() => removeLicense(license.id)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-destructive transition-all p-2 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        </Card>
                      ))}

                      {licenses.length === 0 && (
                        <div className="p-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
                           <div className="h-12 w-12 bg-zinc-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-100 text-zinc-300">
                              <FileBadge className="h-6 w-6" />
                           </div>
                           <p className="font-bold text-zinc-900 leading-none">No Credentials Found</p>
                           <p className="text-xs text-zinc-400 mt-2 max-w-[200px] mx-auto">Add your professional engineer licenses to streamline form signatures.</p>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <Card className="border-zinc-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardHeader className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/30">
                       <CardTitle className="text-lg font-bold text-zinc-900">Security & Authentication</CardTitle>
                       <CardDescription className="text-sm font-medium text-zinc-500">Protect your account data with modern security standards.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="flex items-center gap-6 p-6 rounded-xl border border-green-100 bg-green-50/20">
                          <div className="h-12 w-12 bg-white border border-green-200 rounded-xl flex items-center justify-center shadow-sm">
                             <Check className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-bold text-zinc-900 leading-none">Two-Factor Authentication is Active</p>
                             <p className="text-xs font-medium text-zinc-500 mt-1.5 leading-none">Verified through mobile number ending in •••• 567</p>
                          </div>
                          <Button variant="outline" className="h-9 rounded-lg border-zinc-200 text-zinc-600 text-xs font-bold px-4">Manage</Button>
                       </div>

                       <div className="space-y-6 pt-2">
                          <div className="flex items-center gap-2 mb-1 px-1">
                             <Lock className="h-4 w-4 text-zinc-400" />
                             <h4 className="text-sm font-bold text-zinc-900">Credential Update</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                             <div className="space-y-2">
                                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Current Account Password</Label>
                                <Input type="password" placeholder="Confirm current secret" className="h-10 rounded-lg border-zinc-200 text-sm shadow-none" />
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">New Password</Label>
                                   <Input type="password" placeholder="Min 12 characters" className="h-10 rounded-lg border-zinc-200 text-sm shadow-none" />
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-0.5">Confirm New Password</Label>
                                   <Input type="password" placeholder="Match exactly" className="h-10 rounded-lg border-zinc-200 text-sm shadow-none" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
