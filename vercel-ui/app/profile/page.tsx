"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  FileBadge,
  Camera,
  Plus,
  Trash2,
  Save,
  Mail,
  Phone,
  MapPin,
  Lock,
  Check,
  Bell,
  Search,
  Globe,
  CheckCircle2,
  Zap,
  FolderCheck,
  FileCheck,
  Download,
  Monitor,
  PanelLeft,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock Licenses State
  const [licenses, setLicenses] = useState([
    {
      id: 1,
      type: "Electrical Engineer",
      state: "California",
      number: "EE-99201",
    },
    {
      id: 2,
      type: "Contractor (C-10)",
      state: "Arizona",
      number: "ROC-332145",
    },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const addLicense = () => {
    setLicenses([
      ...licenses,
      { id: Date.now(), type: "", state: "", number: "" },
    ]);
  };

  const removeLicense = (id: number) => {
    setLicenses(licenses.filter((l) => l.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* --- SIDEBAR --- */}
      <Sidebar 
        variant="settings"
        activeSettingsTab={activeTab}
        onSettingsTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Content Header */}
        <header className="h-16 px-4 sm:px-6 border-b border-zinc-200 bg-[#F5F0E8] flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar Toggle - visible when sidebar is collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900 -ml-2"
                title="Show sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                {activeTab === "account" && "Account Info"}
                {activeTab === "business" && "Business Details"}
                {activeTab === "licenses" && "Licenses"}
                {activeTab === "security" && "Security"}
                {activeTab === "billing" && "Billing"}
              </h2>
              <p className="text-xs text-zinc-500 font-medium hidden sm:block">
                Manage your organization and preferences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search settings..."
                className="w-48 h-8 pl-8 rounded-lg bg-zinc-50 border-zinc-200 focus:bg-white text-xs"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-white" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="h-8 rounded-lg px-3 sm:px-4 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm"
            >
              {isSaving ? (
                 <span className="sm:hidden">...</span>
              ) : (
                <Save className="h-3.5 w-3.5 sm:mr-2" />
              )}
               <span className={isSaving ? "block" : "hidden sm:inline"}>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              {activeTab === "account" && (
                <div className="grid grid-cols-12 gap-6 items-start">
                  {/* MAIN COLUMN */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Identity Card */}
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Identity</CardTitle>
                            <CardDescription>Public Persona</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          <div className="shrink-0 relative group">
                            <Avatar className="h-24 w-24 border-2 border-zinc-100 shadow-sm">
                              <AvatarImage src="/avatar-placeholder.png" />
                              <AvatarFallback className="text-2xl font-bold bg-zinc-50 text-zinc-400">JD</AvatarFallback>
                            </Avatar>
                            <label className="absolute -bottom-1 -right-1 h-8 w-8 bg-white text-zinc-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-zinc-50 border border-zinc-200 transition-colors">
                              <Camera className="h-4 w-4" />
                              <input type="file" className="hidden" />
                            </label>
                          </div>
                          <div className="flex-1 w-full space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input id="fullName" defaultValue="John Doe" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="headline">Professional Headline</Label>
                              <Input id="headline" defaultValue="Senior Electrical Engineer" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Connectivity Card */}
                    <Card>
                      <CardHeader className="pb-4">
                         <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Connectivity</CardTitle>
                            <CardDescription>Contact Details</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Work Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input defaultValue="j.doe@solarsolutions.com" className="pl-9" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Direct Line</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input defaultValue="+1 (555) 902-1234" className="pl-9" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Localization Card */}
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <Activity className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Preferences</CardTitle>
                            <CardDescription>Regional Settings</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Timezone</Label>
                          <Select defaultValue="pst">
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                              <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Language</Label>
                          <Select defaultValue="en-us">
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en-us">English (United States)</SelectItem>
                              <SelectItem value="es-mx">Spanish (Mexico)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* SIDE COLUMN */}
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Status Widget */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">Verified</CardTitle>
                            <CardDescription>Account Status</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-100 last:border-0 last:pb-0">
                          <span className="text-zinc-500">Member Since</span>
                          <span className="font-medium text-zinc-900">Oct 14, 2024</span>
                        </div>
                         <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-100 last:border-0 last:pb-0">
                          <span className="text-zinc-500">Last Audit</span>
                          <span className="font-medium text-zinc-900">3 days ago</span>
                        </div>
                      </CardContent>
                    </Card>

                     {/* Tips Widget */}
                    <Card className="bg-amber-50/50 border-amber-100">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base text-amber-900">Quick Tips</CardTitle>
                            <CardDescription className="text-amber-700">Profile Guidance</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-amber-800 leading-relaxed">
                          💡 Your <strong>Identity</strong> section is used in automated stamp generation. Ensure your name matches your license exactly.
                        </p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          🛠 Use the <strong>Preferences</strong> settings to align your workspace with your physical office location.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Corporate Identity */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Corporate Identity</CardTitle>
                          <CardDescription>Brand Management</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row items-start gap-8">
                        <div className="shrink-0 space-y-3">
                          <div className="w-32 h-32 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center relative group cursor-pointer hover:bg-zinc-100 transition-colors">
                            <Image src="/logo.png" alt="Logo" width={100} height={40} className="h-8 w-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-semibold text-zinc-600 bg-white/80 px-2 py-1 rounded shadow-sm">Update</span>
                             </div>
                          </div>
                        </div>
                        <div className="flex-1 w-full grid gap-4">
                          <div className="grid gap-2">
                             <Label>Legal Company Name</Label>
                             <Input defaultValue="Solar Solutions Inc." />
                          </div>
                          <div className="grid gap-2">
                             <Label>Tax ID</Label>
                             <Input defaultValue="XX-XXXX931" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* HQ Location */}
                  <Card>
                    <CardHeader className="pb-4">
                       <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">HQ Location</CardTitle>
                          <CardDescription>Registered Address</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="grid sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                             <Label>Street Address</Label>
                             <Input defaultValue="123 Solar Way" />
                          </div>
                          <div className="grid gap-2">
                             <Label>Suite / Floor</Label>
                             <Input defaultValue="Building 4, Suite 201" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="grid gap-2">
                             <Label>City</Label>
                             <Input defaultValue="Los Angeles" />
                          </div>
                          <div className="grid gap-2">
                             <Label>State</Label>
                             <Input defaultValue="California" />
                          </div>
                          <div className="grid gap-2 col-span-2 sm:col-span-1">
                             <Label>Zip Code</Label>
                             <Input defaultValue="90001" />
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "licenses" && (
                <div className="grid grid-cols-12 gap-6 items-start">
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <Card>
                      <CardHeader className="pb-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileBadge className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">Professional Credentials</CardTitle>
                                <CardDescription>Active Licenses</CardDescription>
                              </div>
                           </div>
                           <Button onClick={addLicense} size="sm" variant="outline">
                             <Plus className="mr-2 h-4 w-4" /> Add License
                           </Button>
                         </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {licenses.map((license) => (
                           <div key={license.id} className="p-4 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors group">
                              <div className="flex items-start justify-between mb-4">
                                 <Badge variant="secondary" className="font-semibold text-primary bg-primary/10 hover:bg-primary/20">{license.state || "New License"}</Badge>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-red-600 -mr-2"
                                    onClick={() => removeLicense(license.id)}
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                              <div className="grid sm:grid-cols-3 gap-4">
                                 <div className="grid gap-2">
                                    <Label className="text-xs text-zinc-500">State</Label>
                                    <Input defaultValue={license.state} className="h-9" />
                                 </div>
                                 <div className="grid gap-2">
                                    <Label className="text-xs text-zinc-500">License Type</Label>
                                    <Input defaultValue={license.type} className="h-9" />
                                 </div>
                                 <div className="grid gap-2">
                                    <Label className="text-xs text-zinc-500">License Number</Label>
                                    <Input defaultValue={license.number} className="h-9" />
                                 </div>
                              </div>
                           </div>
                        ))}
                         {licenses.length === 0 && (
                            <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                               <FileBadge className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                               <p className="text-sm font-medium text-zinc-900">No Credentials Added</p>
                               <p className="text-xs text-zinc-500 mt-1">Add your PE licenses to enable automated signatures.</p>
                            </div>
                         )}
                      </CardContent>
                    </Card>

                     <Card>
                      <CardHeader className="pb-4">
                         <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <FolderCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Document Vault</CardTitle>
                            <CardDescription>Signed Records</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                         {[1, 2].map((_, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 bg-white rounded flex items-center justify-center border border-zinc-200 shadow-sm">
                                    <FileCheck className="h-4 w-4 text-primary" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-zinc-900">Engineering_License_CA.pdf</p>
                                    <p className="text-[10px] text-zinc-500">Uploaded 12/10/24</p>
                                 </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-primary">
                                 <Download className="h-4 w-4" />
                              </Button>
                           </div>
                         ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="grid gap-6">
                   <Card>
                      <CardHeader className="pb-4">
                         <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <Lock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Authentication</CardTitle>
                            <CardDescription>Gatekeeper Settings</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-green-50 border border-green-100 gap-4">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-green-200 shadow-sm">
                                   <Check className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                   <p className="text-sm font-semibold text-green-900">Multi-Factor Auth Active</p>
                                   <p className="text-xs text-green-700">Primary: SMS Verification</p>
                                </div>
                             </div>
                             <Button size="sm" className="bg-white text-green-700 hover:bg-green-50 border border-green-200 shadow-sm">Manage</Button>
                         </div>

                         <div className="grid gap-4 max-w-xl">
                            <div className="grid gap-2">
                               <Label>Current Password</Label>
                               <Input type="password" placeholder="••••••••••••" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                  <Label>New Password</Label>
                                  <Input type="password" placeholder="Min 12 chars" />
                               </div>
                               <div className="grid gap-2">
                                  <Label>Confirm Password</Label>
                                  <Input type="password" placeholder="Confirm new password" />
                               </div>
                            </div>
                            <div>
                               <Button variant="outline">Update Password</Button>
                            </div>
                         </div>
                      </CardContent>
                   </Card>

                   <Card>
                      <CardHeader className="pb-4">
                         <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Session Activity</CardTitle>
                            <CardDescription>Active sessions</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                         <div className="space-y-1">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition-colors group">
                               <div className="flex items-center gap-4">
                                 <div className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${i === 0 ? 'bg-green-500' : 'bg-zinc-300'}`} />
                                 <div>
                                    <p className="text-sm font-medium text-zinc-900">Chrome on MacOS</p>
                                    <p className="text-xs text-zinc-500">Los Angeles, US • {i === 0 ? 'Active Now' : '2 hours ago'}</p>
                                 </div>
                               </div>
                               {i !== 0 && (
                                 <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100">
                                   Revoke
                                 </Button>
                               )}
                            </div>
                          ))}
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
  );
}
