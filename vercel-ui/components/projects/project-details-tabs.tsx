"use client"

import React from "react"
import { Project } from "@/types/project"
import { 
  User, 
  Zap, 
  Building2, 
  Mail, 
  Phone,
  FileText,
  Home,
  Box,
  Download,
  ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const DetailRow = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => (
  <div className="flex flex-col gap-1 py-3 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className="text-sm font-semibold text-zinc-900">
      {value || <span className="text-muted-foreground/40 font-normal italic">Not provided</span>}
    </div>
  </div>
)

export const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </div>
    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">{title}</h3>
  </div>
)

export function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div>
          <SectionTitle title="Project Summary" icon={Zap} />
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="System Size" value={project.systemSize} />
            <DetailRow label="System Type" value={project.systemType} />
            <DetailRow label="PV Modules" value={project.pvModules} />
            <DetailRow label="Inverters" value={project.inverters} />
            <DetailRow label="Battery Backup" value={project.batteryBackup ? "Yes" : "No"} />
            <DetailRow label="Created On" value={new Intl.DateTimeFormat('en-US').format(new Date(project.createdAt))} />
          </div>
        </div>

        <div>
          <SectionTitle title="Customer Profile" icon={User} />
          <div className="space-y-1">
            <DetailRow label="Contact Name" value={project.user_profile?.contact_name} icon={User} />
            <DetailRow label="Company" value={project.user_profile?.company_name} icon={Building2} />
            <DetailRow label="Email" value={project.user_profile?.email} icon={Mail} />
            <DetailRow label="Phone" value={project.user_profile?.phone} icon={Phone} />
          </div>
        </div>
      </div>

      {project.general_notes && (
        <div>
           <SectionTitle title="General Notes" icon={FileText} />
           <div className="p-4 rounded-2xl bg-card border border-border text-sm text-zinc-700 leading-relaxed font-medium">
             {project.general_notes}
           </div>
        </div>
      )}
    </div>
  )
}

export function SiteTab({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      <div>
        <SectionTitle title="Roof & Site Details" icon={Home} />
        <div className="space-y-1">
          <DetailRow label="Roof Material" value={project.site_details?.roof_material} />
          <DetailRow label="Roof Pitch" value={project.site_details?.roof_pitch} />
          <DetailRow label="Number of Arrays" value={project.site_details?.number_of_arrays} />
          <DetailRow label="Utility Provider" value={project.site_details?.utility_provider} />
          <DetailRow label="Jurisdiction" value={project.site_details?.jurisdiction} />
        </div>
      </div>

      <div>
        <SectionTitle title="Electrical Configuration" icon={Zap} />
        <div className="space-y-1">
          <DetailRow label="Main Panel Size" value={project.electrical_details?.main_panel_size} />
          <DetailRow label="Bus Rating" value={project.electrical_details?.bus_rating} />
          <DetailRow label="Main Breaker" value={project.electrical_details?.main_breaker} />
          <DetailRow label="PV Breaker Location" value={project.electrical_details?.pv_breaker_location} />
          <DetailRow label="Meter Location" value={project.advanced_electrical_details?.meter_location} />
          <DetailRow label="Service Type" value={project.advanced_electrical_details?.service_entrance_type} />
        </div>
      </div>
    </div>
  )
}

export function EquipmentTab({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      <SectionTitle title="System Equipment" icon={Box} />
      {(project.system_components && project.system_components.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.system_components.map((comp, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-tighter text-[10px] font-black px-2 py-0.5">
                  {comp.type}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Qty</span>
                  <span className="text-sm font-black text-zinc-900 leading-none">{comp.qty}</span>
                </div>
              </div>
              <div className="font-bold text-zinc-900 text-lg leading-tight">{comp.make_model}</div>
              {comp.notes && (
                <div className="text-xs text-muted-foreground font-medium bg-secondary/50 p-2.5 rounded-xl border border-border/50 italic">
                  "{comp.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-3xl text-muted-foreground/40 font-bold italic">
           No specific components listed.
        </div>
      )}
    </div>
  )
}

export function FilesTab({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      <SectionTitle title="Google Drive Documentation" icon={FileText} />
      {(project.uploads && project.uploads.length > 0) ? (
        <div className="space-y-3">
          {project.uploads.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-shadow group shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-base">{file.name}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{file.category || 'External Link'}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white font-bold h-10 px-4 group/btn" 
                onClick={() => window.open(file.url, '_blank')}
              >
                Open in Drive
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-3xl text-muted-foreground/40 font-bold italic">
           No external Drive links provided for this project.
        </div>
      )}
    </div>
  )
}
