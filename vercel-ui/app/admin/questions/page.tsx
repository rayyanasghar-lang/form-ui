"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Database,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  Tag,
  X,
  Type,
  ListOrdered,
  Layout,
  Globe,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  fetchAdminQuestions, 
  createQuestion, 
  fetchCategories 
} from "@/app/actions/admin-api"
import { AdminQuestion, Category } from "@/types/admin"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function QuestionManagerPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  
  const [newQuestion, setNewQuestion] = useState<Partial<AdminQuestion>>({
    label: "",
    key: "",
    inputType: "char",
    category: "technical",
    priority: 10,
    isCommon: true
  })

  useEffect(() => {
    loadQuestions()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await fetchCategories()
      if (res.status === "success" && res.data) {
        setAvailableCategories(res.data)
      }
    } catch (e) {}
  }

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const res = await fetchAdminQuestions()
      if (res.status === "success" && res.data) {
        setQuestions(res.data)
      } else {
        toast.error("Failed to load questions")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.label || !newQuestion.key) {
      return toast.error("Label and Key are required")
    }
    
    setIsSaving(true)
    try {
      const res = await createQuestion(newQuestion)
      if (res.status === "success") {
        toast.success("Question created successfully")
        setIsDialogOpen(false)
        loadQuestions()
      } else {
        toast.error(res.message || "Failed to create question")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         q.key.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || q.category === activeCategory
    return matchesSearch && matchesCategory
  })

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(questions.map(q => 
    typeof q.category === "string" ? q.category : q.category?.id || "general"
  )))]

  return (
    <div className="space-y-12 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">Question <span className="text-primary italic">Bank</span></h1>
          <p className="text-zinc-500 font-medium text-lg">Define and organize technical questions for your engineering workflows.</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="h-16 px-10 rounded-full font-black shadow-2xl shadow-primary/20 gap-3 group bg-zinc-900 hover:bg-zinc-800"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Create Question
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <Input 
            placeholder="Search by label or key..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 pl-14 pr-6 rounded-3xl border-zinc-100 bg-white/50 backdrop-blur-md focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold"
          />
        </div>
        <div className="flex gap-2 p-2 bg-zinc-100/50 backdrop-blur-md rounded-3xl border border-zinc-200">
           {categories.map(cat => (
             <button
               key={String(cat)}
               onClick={() => setActiveCategory(String(cat))}
               className={cn(
                 "px-6 h-12 rounded-2xl font-black text-sm transition-all whitespace-nowrap",
                 activeCategory === cat 
                   ? "bg-white text-zinc-900 shadow-xl border border-zinc-200 scale-105" 
                   : "text-zinc-400 hover:text-zinc-600"
               )}
             >
               {String(cat).charAt(0).toUpperCase() + String(cat).slice(1)}
             </button>
           ))}
        </div>
      </div>

      {/* Question Table */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-zinc-100 shadow-2xl shadow-zinc-100/30 overflow-hidden">
        <div className="p-10 border-b border-zinc-100 flex items-center justify-between bg-white/50">
          <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-4">
            <Database className="w-7 h-7 text-primary" />
            {filteredQuestions.length} Questions
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full font-black border-2 px-6 h-12">Export CVS</Button>
            <Button variant="outline" className="rounded-full font-black border-2 px-6 h-12">Bulk Actions</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50">
                <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Label & Key</th>
                <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Syncing Question Bank...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-zinc-300" />
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 mb-2">No matching questions</h4>
                      <p className="text-zinc-500 font-medium max-w-sm mx-auto">Try adjusting your search query or category filter to find what you're looking for.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <motion.tr 
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-zinc-900 mb-1 group-hover:text-primary transition-colors cursor-pointer">{q.label}</span>
                          <span className="text-xs font-bold text-zinc-400 font-mono tracking-tight uppercase px-2 py-0.5 bg-zinc-100 rounded-md self-start">{q.key}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                             <Tag className="w-4 h-4" />
                          </div>
                          <span className="text-[13px] font-black text-zinc-700 capitalize italic">{q.inputType}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-900 text-xs font-black tracking-wide border border-transparent group-hover:border-zinc-200 transition-all">
                          {typeof q.category === 'string' ? q.category : q.category?.name || 'General'}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         {q.active !== false ? (
                            <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-xl">
                               <CheckCircle2 className="w-4 h-4" />
                               Active
                            </div>
                         ) : (
                            <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-widest bg-red-50 px-3 py-2 rounded-xl">
                               <XCircle className="w-4 h-4" />
                               Archived
                            </div>
                         )}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                              <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none rounded-[40px] shadow-2xl">
          <div className="bg-zinc-900 p-10 text-white relative">
             <DialogHeader>
                <DialogTitle className="text-4xl font-black tracking-tighter flex items-center gap-4">
                  <Database className="w-8 h-8 text-primary" />
                  New Question
                </DialogTitle>
             </DialogHeader>
             <p className="text-zinc-400 font-bold mt-2">Define a new question for the global engineering bank.</p>
             <X className="absolute right-8 top-8 w-6 h-6 text-zinc-600 cursor-pointer hover:text-white transition-colors" onClick={() => setIsDialogOpen(false)} />
          </div>

          <div className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Display Label</label>
                   <div className="relative">
                      <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <Input 
                        placeholder="e.g., Roof Pitch" 
                        value={newQuestion.label}
                        onChange={e => setNewQuestion({...newQuestion, label: e.target.value})}
                        className="h-14 pl-12 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Unique Key (Backend)</label>
                   <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <Input 
                        placeholder="e.g., roof_pitch" 
                        value={newQuestion.key}
                        onChange={e => setNewQuestion({...newQuestion, key: e.target.value})}
                        className="h-14 pl-12 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold"
                      />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Input Type</label>
                   <div className="relative group">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <select 
                        value={newQuestion.inputType}
                        onChange={e => setNewQuestion({...newQuestion, inputType: e.target.value as any})}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none outline-none"
                      >
                         <option value="char">Text Input</option>
                         <option value="number">Numeric</option>
                         <option value="select">Dropdown</option>
                         <option value="boolean">Switch / Toggle</option>
                         <option value="file">File Upload</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Category</label>
                   <div className="relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <select 
                        value={String(newQuestion.category)}
                        onChange={e => setNewQuestion({...newQuestion, category: e.target.value})}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none outline-none"
                      >
                         {availableCategories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                      </select>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Global Priority</label>
                   <div className="relative">
                      <ListOrdered className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <Input 
                        type="number"
                        value={newQuestion.priority}
                        onChange={e => setNewQuestion({...newQuestion, priority: Number(e.target.value)})}
                        className="h-14 pl-12 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                   </div>
                </div>
                <div className="flex items-center gap-4 pt-8">
                   <label className="flex items-center gap-3 cursor-pointer group/toggle">
                      <div className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        newQuestion.isCommon ? "bg-primary" : "bg-zinc-200"
                      )} onClick={() => setNewQuestion({...newQuestion, isCommon: !newQuestion.isCommon})}>
                         <div className={cn(
                           "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                           newQuestion.isCommon ? "left-7" : "left-1"
                         )} />
                      </div>
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest group-hover/toggle:text-zinc-900">Is Common Field</span>
                   </label>
                </div>
             </div>
          </div>

          <div className="p-10 bg-zinc-50 flex items-center justify-end gap-4 border-t border-zinc-100">
             <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full px-8 h-12 font-black text-zinc-400">Cancel</Button>
             <Button 
               onClick={handleCreateQuestion} 
               disabled={isSaving}
               className="h-12 px-10 rounded-full font-black bg-zinc-900 hover:bg-emerald-600 shadow-xl transition-all gap-2"
             >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Database className="w-4 h-4" />}
                Save Question
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
