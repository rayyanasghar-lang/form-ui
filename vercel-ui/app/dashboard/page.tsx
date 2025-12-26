"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  PlusCircle, 
  LayoutDashboard, 
  UserCircle2, 
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"

export default function DashboardPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const navOptions = [
    {
      title: "Get Started with Project",
      description: "Start a new permit planset request for your solar installation.",
      icon: PlusCircle,
      href: "/forms",
      primary: true,
      color: "oklch(68.351% 0.19585 34.956)",
      blobClass: "top-0 right-0 rounded-bl-full -mr-8 -mt-8"
    },
    {
      title: "View Projects",
      description: "Track progress, download approved plans, and manage active submissions.",
      icon: LayoutDashboard,
      href: "/projects",
      primary: false,
      color: "oklch(0.65 0.15 184.7)",
      blobClass: "bottom-0 left-0 rounded-tr-full -ml-8 -mb-8"
    },
    {
      title: "User Profile",
      description: "Manage your company details, licenses, and notification preferences.",
      icon: UserCircle2,
      href: "/profile",
      primary: false,
      color: "oklch(0.55 0.1 227.4)",
      blobClass: "top-0 left-0 rounded-br-full -ml-8 -mt-8"
    }
  ]

  return (
    <div className="min-h-screen relative selection:bg-primary/20">
      <Navbar title="Dashboard" />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative">
        {/* Background Decorative Element */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Welcome back, <span style={{ color: "oklch(68.351% 0.19585 34.956)" }}>John</span>!
            </h1>
            <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
              What would you like to do today? Select an option below to manage your solar permit workflow.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {navOptions.map((option, i) => (
            <motion.div key={i} variants={item}>
              <Link href={option.href} className="group block h-full">
                <Card className={`h-full relative overflow-hidden bg-[#F5F0E8] border-[#E8E0D5] shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-3 rounded-[2.5rem] group ${option.primary ? 'border-primary/20' : ''}`}>
                  <div 
                    className={`absolute w-32 h-32 opacity-10 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20 ${option.blobClass}`}
                    style={{ backgroundColor: option.color }}
                  />
                  
                  <CardHeader className="pt-10 pb-4">
                    <div 
                      className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: `${option.color}15`, color: option.color }}
                    >
                      <option.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-base font-medium leading-relaxed min-h-16">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-10 pt-4 flex items-center text-sm font-bold tracking-wide uppercase">
                    <span 
                      className="inline-flex items-center gap-1 transition-all duration-300 group-hover:gap-3"
                      style={{ color: "oklch(68.351% 0.19585 34.956)" }}
                    >
                      Browse Option <ChevronRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity Mini-Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 p-8 rounded-[2.5rem] border border-[#E8E0D5] bg-[#F5F0E8] shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Updates</h2>
            <Button variant="link" className="font-bold opacity-60 hover:opacity-100">View History</Button>
          </div>
          <div className="space-y-4">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center gap-6 p-4 rounded-[1.25rem] bg-[#EDE8E0] border border-[#E0D9CF] hover:bg-[#E5DFD5] transition-colors">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Permit #SP-7729 Approved</p>
                  <p className="text-sm text-muted-foreground">Ready for download & submission to AHJ</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Modern Footer Nav for Mobile */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md h-16 bg-black/80 backdrop-blur-2xl rounded-2xl flex items-center justify-around px-2 border border-white/10 shadow-2xl z-50 md:hidden">
        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white transition-colors">
          <LayoutDashboard className="h-6 w-6" />
        </Button>
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg -translate-y-4 border-4 border-[#EBE5DA]">
          <PlusCircle className="h-6 w-6 text-white" />
        </div>
        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white transition-colors">
          <UserCircle2 className="h-6 w-6" />
        </Button>
      </nav>
    </div>
  )
}
