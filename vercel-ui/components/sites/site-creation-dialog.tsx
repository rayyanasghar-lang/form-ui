"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { MapPin, Building2, User, Loader2, Plus } from "lucide-react"
import { useCreateSite } from "@/hooks/use-site-queries"
import { toast } from "sonner"

const siteSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  address: z.string().min(10, { message: "Please enter a full valid address" }),
  projectType: z.enum(["residential", "commercial"]),
})

interface SiteCreationDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (siteUuid: string) => void
}

export function SiteCreationDialog({ isOpen, onClose, onCreated }: SiteCreationDialogProps) {
  const createSiteMutation = useCreateSite()

  const form = useForm<z.infer<typeof siteSchema>>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      address: "",
      projectType: "residential",
    },
  })

  const onSubmit = async (values: z.infer<typeof siteSchema>) => {
    try {
      // Inject dummy system_type for default project context
      const payload = { ...values, system_type: "roof_mount" }
      const result = await createSiteMutation.mutateAsync(payload)
      if (result.status === "success" && result.data?.id) {
        toast.success("Site created successfully!")
        onCreated(result.data.id)
        onClose()
        form.reset()
      } else {
        toast.error(result.message || "Failed to create site")
      }
    } catch (error) {
      toast.error("An error occurred while creating the site")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none bg-white/90 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        
        <DialogHeader className="px-8 pt-8 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">Create New Site</DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium">
            Register a new physical location to begin engineering services.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-8 pb-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-400">Site Reference Name</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input 
                        placeholder="e.g. Smith Residence 2024" 
                        {...field} 
                        className="pl-11 h-12 rounded-xl border-zinc-200 bg-white/50 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-400">Physical Address</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <MapPin className="w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input 
                        placeholder="123 Solar Way, Phoenix, AZ" 
                        {...field} 
                        className="pl-11 h-12 rounded-xl border-zinc-200 bg-white/50 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectType"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-400">Project Classification</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white/50 focus:bg-white transition-all shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-zinc-400" />
                          <SelectValue placeholder="Select type" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-zinc-100 shadow-xl p-1">
                      <SelectItem value="residential" className="rounded-lg py-3 focus:bg-primary/5 focus:text-primary">
                        <div className="flex flex-col">
                          <span className="font-bold">Residential</span>
                          <span className="text-[10px] text-zinc-400 font-normal">Single family homes & duplexes</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial" className="rounded-lg py-3 focus:bg-primary/5 focus:text-primary">
                        <div className="flex flex-col">
                          <span className="font-bold">Commercial</span>
                          <span className="text-[10px] text-zinc-400 font-normal">Business, Industrial & Large Scale</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 flex sm:justify-between items-center gap-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 text-zinc-400 hover:text-zinc-600 font-bold">
                Cancel
              </Button>
              <Button 
                type="submit" disabled={createSiteMutation.isPending} className="w-full h-14 rounded-2xl text-lg font-black bg-linear-to-r from-primary to-primary/80 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {createSiteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Site"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
