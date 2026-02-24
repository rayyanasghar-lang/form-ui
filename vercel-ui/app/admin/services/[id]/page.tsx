"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  GitBranch, 
  Database, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  ChevronRight,
  ShieldAlert,
  Save,
  Check,
  Search,
  Filter,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  fetchServiceRules, 
  fetchAdminQuestions, 
  linkQuestionToService, 
  updateMappingRule 
} from "@/app/actions/admin-api"
import { MappingRule, AdminQuestion } from "@/types/admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function RuleMapperPage() {
  const { id: serviceId } = useParams()
  const router = useRouter()
  
  const [rules, setRules] = useState<MappingRule[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<AdminQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLinking, setIsLinking] = useState(false)

  useEffect(() => {
    loadData()
  }, [serviceId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [rulesRes, questionsRes] = await Promise.all([
        fetchServiceRules(serviceId as string),
        fetchAdminQuestions()
      ])

      if (rulesRes.status === "success" && Array.isArray(rulesRes.data)) {
        setRules(rulesRes.data.sort((a, b) => a.orderIndex - b.orderIndex))
      }
      
      if (questionsRes.status === "success" && Array.isArray(questionsRes.data)) {
        setAvailableQuestions(questionsRes.data)
      }
    } catch (e) {
      toast.error("Failed to load mapping data")
    } finally {
      setIsLoading(false)
    }
  }

  const unlinkedQuestions = useMemo(() => {
    const linkedIds = new Set(rules.map(r => r.questionId))
    return availableQuestions.filter(q => !linkedIds.has(q.id) && 
      (q.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
       q.key.toLowerCase().includes(searchQuery.toLowerCase())))
  }, [rules, availableQuestions, searchQuery])

  const handleLinkQuestion = async (q: AdminQuestion) => {
    setIsLinking(true)
    try {
      const res = await linkQuestionToService(serviceId as string, {
        questionId: q.id,
        orderIndex: rules.length + 1,
        isRequired: true
      })
      
      if (res.status === "success") {
        toast.success(`Linked ${q.label}`)
        await loadData()
      } else {
        toast.error("Linking failed")
      }
    } catch(e) {
      toast.error("Network error")
    } finally {
      setIsLinking(false)
    }
  }

  const handleUpdateRule = async (ruleId: string | number, data: Partial<MappingRule>) => {
    try {
       const res = await updateMappingRule(serviceId as string, ruleId, data)
       if (res.status === "success") {
          toast.success("Rule updated")
          setRules(prev => prev.map(r => r.ruleId === ruleId ? { ...r, ...data } : r))
       }
    } catch (e) {
       toast.error("Update failed")
    }
  }

  return (
    <div className="space-y-12 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()}
            className="w-14 h-14 rounded-2xl border-2 hover:bg-zinc-50 transition-all shadow-xl shadow-zinc-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-1">Rule <span className="text-primary italic">Engine</span></h1>
            <p className="text-zinc-500 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Configuring workflow for Service ID: <span className="text-zinc-900 font-black italic">{serviceId}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
             <Button variant="outline" className="h-16 rounded-3xl border-2 font-black px-8">Preview Form</Button>
             <Button className="h-16 rounded-3xl font-black px-10 shadow-2xl shadow-emerald-500/20 bg-zinc-900 hover:bg-emerald-600 gap-3 group">
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Commit Rules
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Active Rules List */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-zinc-100 shadow-2xl shadow-zinc-100/30 p-10">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-4">
                 <GitBranch className="w-7 h-7 text-emerald-500" />
                 Active Workflow Rules
               </h3>
               <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                  {rules.length} steps configured
               </div>
            </div>

            <div className="space-y-4">
               {isLoading ? (
                  <div className="py-32 text-center flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Parsing Mapping Table...</p>
                  </div>
               ) : rules.length === 0 ? (
                  <div className="py-32 text-center border-4 border-dashed border-zinc-50 rounded-[40px]">
                     <ShieldAlert className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                     <h4 className="text-lg font-black text-zinc-900 mb-1">No questions mapped yet</h4>
                     <p className="text-sm text-zinc-400 font-bold max-w-xs mx-auto">Start mapping questions from the library on the right to build the service form.</p>
                  </div>
               ) : (
                  rules.map((rule, idx) => (
                    <motion.div
                      key={rule.ruleId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col md:flex-row items-stretch gap-6 p-6 rounded-[32px] border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all duration-500"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all cursor-grab active:cursor-grabbing">
                             <GripVertical className="w-6 h-6" />
                          </div>
                          <div className="w-10 h-10 rounded-full border-2 border-zinc-100 flex items-center justify-center font-black text-xs text-zinc-400 group-hover:border-emerald-500/20 group-hover:text-emerald-500 transition-all">
                             {rule.orderIndex}
                          </div>
                       </div>

                       <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                             <div>
                                <h4 className="text-lg font-black text-zinc-900 tracking-tight">{rule.label}</h4>
                                <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded shadow-sm">{rule.questionKey}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                   <input 
                                     type="checkbox" 
                                     checked={rule.isRequired} 
                                     onChange={(e) => handleUpdateRule(rule.ruleId, { isRequired: e.target.checked })}
                                     className="w-5 h-5 rounded-md border-2 border-zinc-200 text-emerald-500 focus:ring-emerald-500/20"
                                   />
                                   <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest group-hover/toggle:text-zinc-900 transition-colors">Required</span>
                                </label>
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                          </div>
                          
                          <div className="relative group/logic">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within/logic:text-emerald-500 transition-colors">
                                <GitBranch className="w-3.5 h-3.5" />
                             </div>
                             <input 
                               placeholder="Conditional Logic (e.g., roof_material == 'shingle')"
                               value={typeof rule.condition === 'string' ? rule.condition : JSON.stringify(rule.condition || "")}
                               className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-50 border border-transparent focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all text-[13px] font-bold text-zinc-600 font-mono"
                               onChange={(e) => {/* Handle logic change debounce */}}
                             />
                          </div>
                       </div>
                    </motion.div>
                  ))
               )}
            </div>
          </div>
        </div>

        {/* Question Library Sidebar */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-zinc-900 rounded-[48px] p-8 text-white shadow-2xl shadow-zinc-900/20 sticky top-12">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <Database className="w-6 h-6 text-primary" />
                    Question Library
                 </h3>
                 <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Filter className="w-4 h-4 text-zinc-400" />
                 </div>
              </div>

              <div className="relative mb-8 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                 <input 
                   placeholder="Search library..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border-none focus:bg-white/10 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-zinc-600 outline-none"
                 />
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                 {isLoading ? (
                    <div className="py-12 text-center opacity-30">
                       <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Inventorying...</span>
                    </div>
                 ) : unlinkedQuestions.length === 0 ? (
                    <div className="py-12 text-center opacity-30 border-2 border-dashed border-white/10 rounded-3xl">
                       <h5 className="text-sm font-black mb-1">No matches found</h5>
                       <p className="text-[10px] font-bold text-zinc-500">All questions are either linked or don't match your search.</p>
                    </div>
                 ) : (
                    unlinkedQuestions.map(q => (
                      <div 
                        key={q.id}
                        className="group/item flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => handleLinkQuestion(q)}
                      >
                         <div className="flex-1 pr-4 min-w-0">
                            <h5 className="font-black text-sm text-zinc-200 truncate group-hover/item:text-white transition-colors">{q.label}</h5>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{q.key}</span>
                         </div>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           disabled={isLinking}
                           className="w-10 h-10 rounded-xl bg-white/5 group-hover/item:bg-primary group-hover/item:text-white transition-all shrink-0"
                         >
                            <Plus className="w-4 h-4" />
                         </Button>
                      </div>
                    ))
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                 <div className="flex items-center gap-4 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-[11px] font-bold text-zinc-400 leading-relaxed italic">
                      Linked questions appear instantly in the service workflow. Set <span className="text-white">Order Index</span> to control their sequence.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
