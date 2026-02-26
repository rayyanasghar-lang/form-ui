"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, ArrowRight, Check, CheckCircle2, Save, 
  HelpCircle, AlertCircle, Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

import { fetchProjectByIdAction, updateProjectAction } from "@/app/actions/project-service"
import { fetchServiceQuestions } from "@/app/actions/service-api"
import { DynamicFormEngine } from "@/components/forms/dynamic-form-engine"
import { Project } from "@/types/project"
import { Question } from "@/types/site-centric"

export default function ServiceConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const serviceId = params.serviceId as string

  const [project, setProject] = useState<Project | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        // Fetch Project
        const pRes = await fetchProjectByIdAction(projectId)
        if (pRes.error || !pRes.data) throw new Error(pRes.error || "Project not found")
        setProject(pRes.data)

        // Fetch Questions from API
        const qRes = await fetchServiceQuestions(serviceId)
        if (qRes.status === "error" || !qRes.data) throw new Error(qRes.message || "Questions not found")
        setQuestions(qRes.data)

        // Initialize Form Data from Project
        if (pRes.data && qRes.data) {
          const initialData: Record<string, any> = {}
          const answers = pRes.data.service_answers || {}
          
          qRes.data.forEach(q => {
             if (answers[q.key]) {
               initialData[q.key] = answers[q.key]
             }
          })
          setFormData(initialData)
        }

      } catch (e) {
        console.error(e)
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [projectId, serviceId])

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSaving(true)
    try {
        const payload = { 
          service_answers: { 
            ...(project?.service_answers || {}),
            ...data 
          } 
        }
        
        const res = await updateProjectAction(projectId, payload)
        
        if (res.success) {
            toast.success("Service configuration saved")
            router.push(`/projects/${projectId}`)
        } else {
            throw new Error(res.error)
        }
    } catch (e: any) {
        toast.error("Failed to save", { description: e.message })
    } finally {
        setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (questions.length === 0 && !isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
              <AlertCircle className="h-12 w-12 text-zinc-400 mb-4" />
              <h1 className="text-xl font-bold">Service Questions Not Found</h1>
              <p className="text-zinc-500 mb-6">We couldn't find the configuration form for this service.</p>
              <Button onClick={() => router.push(`/projects/${projectId}`)}>Back to Project</Button>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/projects/${projectId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
             <h1 className="text-xl font-black tracking-tight text-zinc-900">Configure Service</h1>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Project ID: {projectId.slice(0, 8)}</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-zinc-100">
          <DynamicFormEngine 
            questions={questions} 
            onSubmit={handleFormSubmit}
            isSubmitting={isSaving}
            defaultValues={formData}
          />
        </div>
      </main>
    </div>
  )
}
