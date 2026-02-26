"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  LayoutDashboard, 
  Database,
  Briefcase,
  GitBranch,
  ShieldCheck,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Question Bank", href: "/admin/questions", icon: Database },
  { name: "Services", href: "/admin/services", icon: Briefcase },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-80 h-screen bg-white/70 backdrop-blur-3xl border-r border-zinc-100 flex flex-col p-8 sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Sun<span className="text-primary italic">Admin</span></h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Workflow Engine</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center justify-between p-4 rounded-2xl transition-all duration-500 relative overflow-hidden",
                isActive 
                  ? "bg-primary/5 shadow-inner" 
                  : "hover:bg-zinc-50"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"
                  />
                )}
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                    isActive ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-base font-black transition-all",
                    isActive ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-800"
                  )}>
                    {item.name}
                  </span>
                </div>
                
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all duration-300",
                  isActive ? "opacity-100 translate-x-0 text-primary" : "opacity-0 -translate-x-2 text-zinc-300"
                )} />
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="bg-zinc-900 p-6 rounded-[24px] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h4 className="font-black text-lg mb-1 tracking-tight">Need Help?</h4>
            <p className="text-xs text-zinc-400 font-bold mb-4 leading-relaxed">Check the API docs or contact engineering support.</p>
            <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
              Go to Portal
            </Link>
          </div>
          <HelpCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
        </div>
        
        <button className="flex items-center gap-4 p-4 w-full rounded-2xl hover:bg-zinc-50 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-base font-black text-zinc-500 group-hover:text-zinc-900">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
