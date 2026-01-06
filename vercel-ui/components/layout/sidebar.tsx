"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Home, 
  BarChart3, 
  Zap, 
  FileText, 
  Users, 
  FolderKanban,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft,
  User,
  Building2,
  FileBadge,
  ShieldCheck,
  CreditCard,
  User2Icon,
  Plus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

interface SidebarProps {
  variant?: "dashboard" | "settings"
  activeSettingsTab?: string
  onSettingsTabChange?: (tab: string) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function Sidebar({ 
  variant = "dashboard",
  activeSettingsTab = "account",
  onSettingsTabChange,
  collapsed = false,
  onCollapsedChange,
  className
}: SidebarProps & { className?: string }) {
  const pathname = usePathname()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  
  const isCollapsed = onCollapsedChange ? collapsed : internalCollapsed
  const setCollapsed = onCollapsedChange || setInternalCollapsed

  // Dashboard navigation sections
  const dashboardSections = [
    {
      title: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/projects" },
      ],
    },
    {
      title: "Workspace",
      items: [
        { id: "projects", label: "My Projects", icon: FolderKanban, href: "/projects" },
        { id: "new-permit", label: "New Permit", icon: Zap, href: "/forms" },
        { id: "user-profile", label: "User Profile", icon: User2Icon, href: "/profile" },
        { id: "team", label: "Team", icon: Users, href: "#" },
      ],
    },
    {
      title: "Resources",
      items: [
        { id: "documents", label: "Documents", icon: FileText, href: "#" },
        { id: "reports", label: "Reports", icon: FileText, href: "#" },
        { id: "help", label: "Help Center", icon: HelpCircle, href: "#" },
      ],
    },
  ]

  // Settings navigation sections
  const settingsSections = [
    {
      title: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/projects" },
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
  ]

  const sections = variant === "settings" ? settingsSections : dashboardSections

  return (
    <aside 
      className={`flex flex-col border-r border-sidebar-border bg-sidebar z-40 transition-all duration-300 ease-in-out h-screen sticky top-0 ${
        isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-64'
      } ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(true)}
        className="absolute top-5 right-4 z-50 p-2 rounded-lg hover:bg-black/5 transition-colors text-zinc-500 hover:text-zinc-900"
        title="Hide sidebar"
      >
        <PanelLeftClose className="h-4 w-4" />
      </button>

      {/* Header with Logo */}
      <div className="px-5 h-16 flex items-center border-b border-sidebar-border">
        <Link href="/projects" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="SunPermit" width={120} height={40} className="h-10 w-auto" />
        </Link>
      </div>

      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {/* Create Project Button */}
        <div className="px-3 mb-6">
          <Link href="/forms">
            <button 
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 bg-primary"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </button>
          </Link>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
              {section.title}
            </h3>
            {section.items.map((item: any) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                    <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-primary"} transition-colors`} />
                  {item.label}
                </Link>
              ) : (
                  <button
                    key={item.id}
                    onClick={() => onSettingsTabChange?.(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      activeSettingsTab === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon 
                      className={`h-4 w-4 transition-colors ${
                        activeSettingsTab === item.id ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-primary"
                      }`}
                    />
                    {item.label}
                    {activeSettingsTab === item.id && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="ml-auto w-1 h-4 rounded-full bg-sidebar-primary"
                      />
                    )}
                </button>
              )
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-4 bg-sidebar-accent/10 p-3 rounded-xl border border-sidebar-border flex items-center gap-3 group hover:bg-sidebar-accent/20 transition-all">
          <div 
            className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm border border-white/10 shrink-0 bg-sidebar-primary"
          >
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-sidebar-foreground truncate">
              Solar Solutions Inc.
            </p>
            <p className="text-[10px] font-medium text-sidebar-foreground/50 truncate uppercase tracking-wider">
              Admin
            </p>
          </div>
          <button className="text-sidebar-foreground/40 hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

// Export a toggle button for when sidebar is collapsed
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-black/5 transition-colors text-zinc-500 hover:text-zinc-900"
      title="Show sidebar"
    >
      <PanelLeft className="h-5 w-5" />
    </button>
  )
}
