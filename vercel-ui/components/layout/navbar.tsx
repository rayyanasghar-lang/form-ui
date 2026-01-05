"use client"

import Link from "next/link"
import Image from "next/image"
import { Bell, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"

interface NavbarProps {
  title?: string
  backLink?: {
    href: string
    label: string
  }
  children?: React.ReactNode
  actions?: React.ReactNode
}

export function Navbar({ title, backLink, children, actions }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E8] border-b border-[#E8E0D5] h-16 shadow-sm select-none">
      <div className="max-w-[1500px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Left Section: Logo + Context */}
        <div className="flex items-center gap-3">
          <Link href="/projects" className="transition-all hover:opacity-80 active:scale-95 shrink-0 -ml-2">
            <Image src="/logo.png" alt="SunPermit" width={110} height={40} className="h-12 w-auto" />
          </Link>
          
          {(title || backLink) && (
            <div className="h-5 w-px bg-zinc-200/60 hidden sm:block mx-1" />
          )}

          {title && (
            <span className="text-sm font-semibold text-zinc-500 tracking-tight hidden md:block">
              {title}
            </span>
          )}

          {backLink && (
            <Link href={backLink.href} className="ml-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 h-8 px-2 rounded-lg text-xs font-bold transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {backLink.label}
              </Button>
            </Link>
          )}
        </div>

        {/* Center Section: Slot */}
        <div className="flex-1 flex justify-center px-4">
          {children}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end gap-2">
          {actions}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10 text-zinc-500 hover:text-zinc-900 hover:bg-white/50 transition-colors relative focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
          </Button>
          
          <div className="h-6 w-px bg-zinc-200 mx-1" />

          <UserNav />
        </div>
      </div>
    </header>
  )
}
