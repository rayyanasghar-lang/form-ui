"use client"

import { Database, Briefcase, GitBranch, ArrowUpRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stats = [
  { name: "Total Questions", value: "84", change: "+4 this week", icon: Database, color: "bg-blue-500", link: "/admin/questions" },
  { name: "Active Services", value: "12", change: "2 new", icon: Briefcase, color: "bg-emerald-500", link: "/admin/services" },
  { name: "Active Rules", value: "156", change: "+12 updated", icon: GitBranch, color: "bg-purple-500", link: "/admin/services" },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-12 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">Portfolio <span className="text-primary italic">Engine</span></h1>
          <p className="text-zinc-500 font-medium text-lg">Manage your global question bank and business service logic.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-full font-black border-2 transition-all hover:bg-zinc-50">API Docs</Button>
          <Button className="h-14 px-8 rounded-full font-black shadow-2xl shadow-primary/20 gap-3 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Quick Create
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.link}>
            <div className="group bg-white p-10 rounded-[40px] border border-zinc-100 shadow-2xl shadow-zinc-100/50 hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
              <div className="relative z-10">
                <div className={`${stat.color} w-16 h-16 rounded-[24px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-zinc-200 transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{stat.name}</p>
                <div className="flex items-baseline gap-4">
                  <h3 className="text-6xl font-black text-zinc-900 tracking-tighter">{stat.value}</h3>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">{stat.change}</span>
                </div>
              </div>
              <ArrowUpRight className="absolute right-8 top-8 w-8 h-8 text-zinc-100 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-[48px] border border-zinc-100 shadow-2xl shadow-zinc-100/50 p-12">
        <h3 className="text-2xl font-black text-zinc-900 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-orange-500" />
          </div>
          Recent Activity
        </h3>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-6 rounded-[32px] hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-[20px] bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-zinc-900">Modified "Roof Material" question</h4>
                  <p className="text-sm text-zinc-400 font-bold">Category: Technical • 2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" className="rounded-full font-black text-primary px-6">Review</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
