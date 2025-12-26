"use client"

import { 
  Home, 
  BarChart3, 
  Zap, 
  FileText, 
  Users, 
  MoreHorizontal,
  FolderKanban,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#F5F0E8] border-r border-[#E8E0D5] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-[#E8E0D5]">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="SunPermit" width={120} height={40} className="h-10 w-auto" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Home Section */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3 py-2">
            Home
          </p>
          <NavItem 
            icon={Home} 
            label="Dashboard" 
            href="/dashboard" 
            active={pathname === "/dashboard"}
          />
        </div>

        {/* Projects Section */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3 py-2">
            Workspace
          </p>
          <NavItem 
            icon={FolderKanban} 
            label="My Projects" 
            href="/projects" 
            active={pathname === "/projects"}
          />
          <NavItem 
            icon={Zap} 
            label="New Permit" 
            href="/forms" 
            active={pathname === "/forms"}
          />
          <NavItem 
            icon={BarChart3} 
            label="Analytics" 
            href="#" 
          />
          <NavItem 
            icon={Users} 
            label="Team" 
            href="#" 
          />
        </div>

        {/* Documents Section */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3 py-2">
            Resources
          </p>
          <NavItem icon={FileText} label="Documents" href="#" />
          <NavItem icon={FileText} label="Reports" href="#" />
          <NavItem icon={HelpCircle} label="Help Center" href="#" />
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#E8E0D5] space-y-1">
        <NavItem icon={Settings} label="Settings" href="/profile" />
        <NavItem icon={LogOut} label="Log Out" href="#" />
      </div>
    </aside>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-white shadow-sm text-zinc-900"
          : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900"
      }`}
      style={active ? { color: "oklch(68.351% 0.19585 34.956)" } : undefined}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}
