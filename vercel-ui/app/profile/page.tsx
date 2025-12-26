"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  ShieldCheck,
  FileBadge,
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
  Activity,
  Globe,
  CheckCircle2,
  Zap,
  FolderCheck,
  FileCheck,
  Download,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [isSaving, setIsSaving] = useState(false);

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

  const navSections = [
    {
      title: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        { id: "account", label: "Account Info", icon: User },
        { id: "business", label: "Business Details", icon: Building2 },
        { id: "licenses", label: "Licenses", icon: FileBadge },
        { id: "security", label: "Security", icon: ShieldCheck },
      ],
    },
    {
      title: "Organization",
      items: [
        { id: "billing", label: "Billing", icon: CreditCard },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-linear-to-b from-[#FAA93E]/5 via-[#EBE5DA] to-[#E76549]/10 overflow-hidden font-poppins selection:bg-primary/20">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 flex flex-col border-r border-black/5 bg-white/40 backdrop-blur-xl z-40 relative">
        {/* Header */}
        <div className="px-4 h-16 flex items-center border-b border-black/5 bg-transparent">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              Portal
            </span>
          </Link>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                    {section.title}
                  </h3>
                  {section.items.map((item: any) =>
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
                    <item.icon
                      className={`h-4 w-4 transition-colors ${
                        activeTab === item.id
                          ? "text-primary"
                          : "text-zinc-400 group-hover:text-primary"
                      }`}
                    />
                    {item.label}
                    {activeTab === item.id && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="ml-auto w-1 h-4 bg-primary rounded-full"
                      />
                    )}
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5">
          <div className="mb-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center gap-3 group hover:bg-white/20 transition-all">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm border border-black/5 shrink-0">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">
                Solar Solutions Inc.
              </p>
              <p className="text-[10px] font-medium text-zinc-500 truncate uppercase tracking-wider">
                Admin
              </p>
            </div>
            <button className="text-zinc-400 hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/5">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="px-2 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <span>v1.2.0</span>
            <span className="h-1 w-1 bg-primary/20 rounded-full" />
            <span>Stable</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Content Header */}
        <header className="h-16 px-6 border-b border-zinc-200/60 bg-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-zinc-900">
              {
                navSections
                  .flatMap((s) => s.items)
                  .find((n) => n.id === activeTab)?.label
              }
            </h2>
            <Separator orientation="vertical" className="h-4 bg-black/10" />
            <p className="text-sm font-medium text-zinc-400">
              Manage your organization and preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search settings..."
                className="w-48 h-9 pl-9 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-primary/20 text-xs transition-all shadow-none"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 outline-none relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              {activeTab === "account" && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* MAIN COLUMN - STACKED SECTIONS */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Section 1: Personal Branding */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Identity</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Public Persona</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="shrink-0 relative group">
                          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl rounded-full overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                            <AvatarImage src="/avatar-placeholder.png" />
                            <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">JD</AvatarFallback>
                          </Avatar>
                          <label className="absolute -bottom-1 -right-1 h-10 w-10 bg-white text-zinc-600 rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:bg-zinc-50 hover:scale-110 transition-all border border-black/5">
                            <Camera className="h-5 w-5" />
                            <input type="file" className="hidden" />
                          </label>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Full Name</Label>
                            <Input defaultValue="John Doe" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm shadow-inner" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Professional Headline</Label>
                            <Input defaultValue="Senior Electrical Engineer" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm shadow-inner" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Communication */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-tr-full -ml-8 -mb-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Connectivity</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Global Reach</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Work Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input type="email" defaultValue="j.doe@solarsolutions.com" className="h-12 pl-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Direct Line</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input type="tel" defaultValue="+1 (555) 902-1234" className="h-12 pl-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Localization */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-br-full -ml-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                            <Activity className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Context</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Regional Settings</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Preferred Timezone</Label>
                          <select className="flex h-12 w-full rounded-2xl border border-white/40 bg-white/40 px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20">
                            <option>Pacific Standard Time (PST)</option>
                            <option>Eastern Standard Time (EST)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Display Language</Label>
                          <select className="flex h-12 w-full rounded-2xl border border-border bg-white/40 px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20">
                            <option>English (United States)</option>
                            <option>Spanish (Mexico)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    
                  </div>

                  {/* RIGHT CONTEXT PANEL */}
                  <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-0">
                    {/* Status Widget */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-green-500/10 rounded-[1.25rem] flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-zinc-900">Verified</p>
                          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Account Status</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/30 border border-white/20">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Member Since</p>
                          <p className="text-sm font-bold text-zinc-900">October 14, 2024</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/30 border border-white/20">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Last Profile Audit</p>
                          <p className="text-sm font-bold text-zinc-900">3 days ago</p>
                        </div>
                      </div>
                    </div>

                    {/* Guidance Widget */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-amber-500/10 rounded-[1.25rem] flex items-center justify-center">
                          <Zap className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-zinc-900">Tips</p>
                          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Guidance</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-[11px] leading-relaxed text-zinc-600 font-medium">
                        <p className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                          💡 Your <span className="text-zinc-900 font-bold">Identity</span> section is used in automated stamp generation. Ensure your name matches your license exactly.
                        </p>
                        <p className="p-4 rounded-2xl bg-white/20 border border-white/20">
                          🛠 Use the <span className="text-zinc-900 font-bold">Context</span> settings to align your workspace with your physical office location.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* MAIN COLUMN - STACKED SECTIONS */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Section 1: Core Branding */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Corporate Identity</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Brand Management</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="w-36 space-y-3 shrink-0">
                          <div className="w-full aspect-square bg-white/40 border-2 border-dashed border-white rounded-4xl flex flex-col items-center justify-center relative group cursor-pointer hover:bg-white/60 transition-all shadow-inner">
                             <Image src="/logo.png" alt="Company Logo" width={100} height={40} className="h-12 w-auto opacity-70 group-hover:opacity-100 transition-all" />
                             <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[10px] font-bold text-zinc-900 uppercase">
                                Update
                             </div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Legal Company Name</Label>
                             <Input defaultValue="Solar Solutions Inc." className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Tax Identification Number</Label>
                             <Input defaultValue="XX-XXXX931" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Physical Presence */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-tr-full -ml-8 -mb-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-rose-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">HQ Location</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Registered Address</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Street Address</Label>
                              <Input defaultValue="123 Solar Way" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Suite / Floor</Label>
                              <Input defaultValue="Building 4, Suite 201" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">City</Label>
                              <Input defaultValue="Los Angeles" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">State</Label>
                              <Input defaultValue="California" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Zip Code</Label>
                              <Input defaultValue="90001" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white text-sm" />
                           </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === "licenses" && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* MAIN COLUMN - STACKED SECTIONS */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Section 1: Verified Credentials */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-br-full -ml-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <FileBadge className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Professional Credentials</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Active Licenses</p>
                          </div>
                        </div>
                        <Button onClick={addLicense} className="h-10 rounded-xl px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg transition-all active:scale-95">
                           <Plus className="mr-2 h-4 w-4" /> Add License
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {licenses.map((license) => (
                          <div key={license.id} className="p-6 rounded-3xl bg-white/30 border border-white/20 hover:bg-white/50 transition-all group relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                             <div className="flex items-center justify-between relative mb-6">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{license.state}</span>
                                <button 
                                  onClick={() => removeLicense(license.id)}
                                  className="text-zinc-300 hover:text-destructive transition-all p-2 opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                             <div className="grid grid-cols-3 gap-6 relative">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">State</Label>
                              <input defaultValue={license.state} className="h-11 border-white/40 rounded-xl text-sm bg-white/40 focus:bg-white shadow-inner pl-3"/>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">License Type</Label>
                                  <Input defaultValue={license.type} className="h-11 border-white/40 rounded-xl text-sm bg-white/40 focus:bg-white shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">License Number</Label>
                                  <Input defaultValue={license.number} className="h-11 border-white/40 rounded-xl text-sm bg-white/40 focus:bg-white shadow-inner" />
                                </div>
                             </div>
                          </div>
                        ))}
                        {licenses.length === 0 && (
                           <div className="p-12 text-center border-2 border-dashed border-white/60 rounded-[2.5rem] bg-white/20">
                              <FileBadge className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
                              <p className="text-sm font-bold text-zinc-900">No Credentials Added</p>
                              <p className="text-[10px] font-medium text-zinc-500 mt-1 italic">Add your PE licenses to enable automated signatures.</p>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Document Vault */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-tl-full -mr-8 -mb-8 transition-all duration-500 group-hover:scale-110" />
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <FolderCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Document Vault</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Signed Records</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                         {[1, 2].map((_, i) => (
                           <div key={i} className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <FileCheck className="h-5 w-5 text-indigo-500" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-zinc-900 leading-none">Engineering_License_CA.pdf</p>
                                    <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Uploaded 12/10/24</p>
                                 </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-primary"><Download className="h-4 w-4" /></Button>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* MAIN COLUMN - STACKED SECTIONS */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Section 1: Authentication */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/10 rounded-br-full -ml-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                       <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-500/10 rounded-2xl flex items-center justify-center">
                            <Lock className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Authentication</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Gatekeeper Settings</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="flex items-center gap-6 p-6 rounded-3xl bg-green-500/5 border border-green-500/10">
                            <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                               <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-bold text-zinc-900">Multi-Factor Auth Active</p>
                               <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1">Primary: SMS Verification</p>
                            </div>
                            <Button variant="ghost" className="rounded-xl px-6 text-xs font-bold text-green-600 hover:bg-green-500/10">Manage</Button>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-4 pt-4">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Current Secret Key</Label>
                               <Input type="password" placeholder="••••••••••••" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">New Passcode</Label>
                                  <Input type="password" placeholder="Min 12 Chars" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white" />
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Verify New</Label>
                                  <Input type="password" placeholder="Redundant Check" className="h-12 rounded-2xl border-white/40 bg-white/40 focus:bg-white" />
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Section 2: Session Activity */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-all duration-500 group-hover:scale-110" />
                       <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-none">Activity Stream</h3>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Entry History</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                         {[1, 2, 3].map((_, i) => (
                           <div key={i} className="p-4 rounded-2xl bg-white/20 border border-white/10 flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
                                 <div>
                                    <p className="text-xs font-bold text-zinc-900">Chrome on MacOS Sonoma</p>
                                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Los Angeles, US • {i === 0 ? 'Active Now' : '2 hours ago'}</p>
                                 </div>
                              </div>
                              {i !== 0 && <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 px-3 text-[10px] font-bold text-destructive hover:bg-destructive/10">Revoke</Button>}
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
