"use client"

import Link from "next/link"
import { 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center gap-3 p-1 rounded-full hover:bg-zinc-100 transition-all focus-visible:ring-2 focus-visible:ring-primary/20 outline-none group"
          aria-label="User account"
        >
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm border border-black/5 ring-2 ring-white transition-transform group-hover:scale-105">
              JD
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-zinc-900 leading-tight">Solar Solutions Inc.</p>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Admin</p>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-y-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-3 w-64 bg-white/10 border border-zinc-200/60 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in duration-200">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer group outline-none">
            <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors border border-zinc-100">
              <Settings className="h-4 w-4 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-bold">Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/5 transition-all cursor-pointer group outline-none">
          <div className="h-8 w-8 bg-destructive/5 rounded-lg flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          <Link href="/" className="text-sm font-bold">Sign Out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
