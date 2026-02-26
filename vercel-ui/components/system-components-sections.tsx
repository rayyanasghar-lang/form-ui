"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useCallback } from "react"
import { uploadWithRcloneAction } from "@/app/actions/upload-rclone"
import { cn } from "@/lib/utils"
import { EquipmentSearchSelector } from "./equipment-search-selector"
import { Plus, Trash2, Upload, Loader2, Eye, Sun, Zap, Power, Battery, FileCode, Paperclip, Settings2, Search, CheckCircle2 } from "lucide-react"




// Equipment types with their display names and icons
const EQUIPMENT_SECTIONS = [
    { type: "solar", label: "Solar Modules", icon: Sun, description: "PV panels and modules", apiType: "solar" },
    { type: "inverter", label: "Inverters", icon: Zap, description: "String or micro inverters", apiType: "inverter" },
    { type: "disconnect", label: "AC Disconnect", icon: Power, description: "AC disconnect switches", apiType: "disconnect" },
    { type: "optimizer", label: "Optimizers", icon: Settings2, description: "DC power optimizers", apiType: "optimizer" },
    { type: "battery", label: "Battery Storage", icon: Battery, description: "Energy storage systems", apiType: "battery" },
    { type: "referenceCodes", label: "Reference Codes", icon: FileCode, description: "Code references and standards", apiType: "referenceCodes" },
    { type: "attachment", label: "Attachments", icon: Paperclip, description: "Mounting and racking hardware", apiType: "attachment" },
] as const

// API response types
interface EquipmentSearchItem {
    uuid: string
    brandName: string
    model: string
    display_label: string
}

export interface EquipmentItem {
    id: string
    type: string
    makeModel: string
    qty: string
    attachment: string[]
    notes: string
    equipment_id?: string // UUID from equipment search
}

interface SystemComponentsSectionsProps {
    components: EquipmentItem[]
    onAddComponent: (type?: string) => void
    onUpdateComponent: (id: string, updates: Partial<Record<keyof EquipmentItem | string, any>>) => void
    onRemoveComponent: (id: string) => void
}

// Get API type from section type
function getApiType(sectionType: string): string {
    const section = EQUIPMENT_SECTIONS.find(s => s.type === sectionType)
    return section?.apiType || sectionType
}

export default function SystemComponentsSections({
    components,
    onAddComponent,
    onUpdateComponent,
    onRemoveComponent,
}: SystemComponentsSectionsProps) {
    
    // Group components by type
    const getComponentsByType = (type: string) => {
        return components.filter(c => c.type.toLowerCase() === type.toLowerCase())
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Add equipment by clicking the <Plus className="inline h-3 w-3" /> button in each section. Search for verified models in the Make/Model field.
            </p>

            <div className="grid gap-6">
                {EQUIPMENT_SECTIONS.map((section) => {
                    const sectionComponents = getComponentsByType(section.type)
                    const SectionIcon = section.icon
                    
                    return (
                        <Card 
                            key={section.type} 
                            className={cn(
                                "rounded-2xl border-border transition-all duration-200",
                                sectionComponents.length > 0 && "ring-1 ring-primary/20"
                            )}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                            sectionComponents.length > 0 
                                                ? "bg-primary/10 text-primary" 
                                                : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            <SectionIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                                {section.label}
                                                {sectionComponents.length > 0 && (
                                                    <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                                        {sectionComponents.length}
                                                    </span>
                                                )}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">{section.description}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => onAddComponent(section.type)}
                                        className="gap-1.5 h-9 px-3 rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                            </CardHeader>
                            
                            {sectionComponents.length > 0 && (
                                <CardContent className="pt-0 space-y-3">
                                    {sectionComponents.map((component, idx) => (
                                        <EquipmentRow
                                            key={component.id}
                                            component={component}
                                            index={idx + 1}
                                            apiType={section.apiType}
                                            onUpdate={(updates) => onUpdateComponent(component.id, updates)}
                                            onRemove={() => onRemoveComponent(component.id)}
                                        />
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

interface EquipmentRowProps {
    component: EquipmentItem
    index: number
    apiType: string
    onUpdate: (updates: Partial<Record<keyof EquipmentItem | string, any>>) => void
    onRemove: () => void
}

function EquipmentRow({ component, index, apiType, onUpdate, onRemove }: EquipmentRowProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-zinc-50/80 border border-zinc-100">
            <div className="flex items-center gap-3 sm:hidden mb-2">
                <span className="text-xs font-bold text-zinc-400 bg-zinc-200/60 px-2 py-1 rounded">#{index}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="ml-auto h-8 w-8 p-0 text-zinc-400 hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="hidden sm:flex items-center">
                <span className="text-xs font-bold text-zinc-400 bg-zinc-200/60 px-2 py-1 rounded">#{index}</span>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Make/Model
                        </Label>
                        {component.equipment_id && (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-green-600 bg-green-50 px-1.5 rounded-md border border-green-100">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                VERIFIED
                            </span>
                        )}
                    </div>
                    <EquipmentSearchSelector
                        value={component.makeModel}
                        equipmentId={component.equipment_id}
                        apiType={apiType}
                        onSelect={(makeModel, equipmentId) => {
                            onUpdate({
                                makeModel,
                                equipment_id: equipmentId || ""
                            })
                        }}
                    />
                </div>
                
                <div className="space-y-1">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Quantity
                    </Label>
                    <Input
                        type="number"
                        min="1"
                        value={component.qty}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || Number(val) >= 0) {
                                onUpdate({ qty: val });
                            }
                        }}
                        className="h-10 rounded-lg border-zinc-200"
                    />
                </div>
                
                <div className="space-y-1">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Spec Sheet
                    </Label>
                    <EquipmentUploader 
                        componentId={component.id}
                        currentAttachment={component.attachment?.[0]}
                        onUploadComplete={(url) => onUpdate({ attachment: [url] })}
                    />
                </div>

                <div className="sm:col-span-4 space-y-1">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        Notes
                        <span className="text-[10px] font-normal text-muted-foreground opacity-50">(optional)</span>
                    </Label>
                    <Input
                        placeholder="Tag, array, etc."
                        value={component.notes}
                        onChange={(e) => onUpdate({ notes: e.target.value })}
                        className="h-10 rounded-lg border-zinc-200"
                    />
                </div>
            </div>
            
            <div className="hidden sm:flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="h-10 w-10 p-0 text-zinc-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            
            {/* Notes row - spans full width */}
            <div className="sm:hidden space-y-1">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes (Optional)
                </Label>
                <Input
                    placeholder="Optional notes"
                    value={component.notes}
                    onChange={(e) => onUpdate({ notes: e.target.value })}
                    className="h-10 rounded-lg border-zinc-200 bg-white"
                />
            </div>
        </div>
    )
}



function EquipmentUploader({ 
    componentId, 
    currentAttachment, 
    onUploadComplete 
}: { 
    componentId: string
    currentAttachment?: string
    onUploadComplete: (url: string) => void 
}) {
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("projectName", "System Components")

        try {
            console.log(`[Frontend] EquipmentUploader calling action for file: ${file.name}`)
            const result = await uploadWithRcloneAction(formData)
            console.log(`[Frontend] EquipmentUploader result:`, result)
            if (result.success && result.webViewLink) {
                onUploadComplete(result.webViewLink)
            } else {
                console.error("Upload failed:", result.error)
                alert("Upload failed: " + result.error)
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload error occurred")
        } finally {
            setUploading(false)
        }
    }

    if (currentAttachment) {
        return (
            <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-10 flex-1 gap-2 rounded-lg" asChild>
                    <a href={currentAttachment} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                        View
                    </a>
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-lg"
                    onClick={() => onUploadComplete("")}
                >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
            </div>
        )
    }

    return (
        <div className="relative">
            <input
                type="file"
                id={`upload-${componentId}`}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <Button 
                variant="outline" 
                size="sm" 
                className="h-10 w-full gap-2 rounded-lg"
                disabled={uploading}
                onClick={() => document.getElementById(`upload-${componentId}`)?.click()}
            >
                {uploading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4" />
                        Upload
                    </>
                )}
            </Button>
        </div>
    )
}
