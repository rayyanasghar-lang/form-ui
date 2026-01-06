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
    <aside className="w-60 bg-background border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/projects" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="SunPermit" width={120} height={40} className="h-10 w-auto" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Home Section */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Home
          </p>
          <NavItem 
            icon={Home} 
            label="Dashboard" 
            href="/projects" 
            active={pathname === "/projects"}
          />
        </div>

        {/* Projects Section */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 py-2">
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
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Resources
          </p>
          <NavItem icon={FileText} label="Documents" href="#" />
          <NavItem icon={FileText} label="Reports" href="#" />
          <NavItem icon={HelpCircle} label="Help Center" href="#" />
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-1">
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
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <div 
        className="h-8 w-8 rounded-lg flex items-center justify-center"
      >
        <Icon 
          className="h-4 w-4" 
        />
      </div>
      {label}
    </Link>
  )
}
