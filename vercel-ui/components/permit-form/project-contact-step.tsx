"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Briefcase, MapPin, CheckCircle2, Zap } from "lucide-react"
import AddressAutocomplete from "../address-autocomplete"
import ProjectInfoPanel from "./project-info-panel"

interface ProjectContactStepProps {
    formData: any
    updateField: (field: string, value: any) => void
    errors: Record<string, string>
}

export default function ProjectContactStep({
    formData,
    updateField,
    errors,
}: ProjectContactStepProps) {

    const lat = formData.latitude ? parseFloat(formData.latitude) : null
    const lng = formData.longitude ? parseFloat(formData.longitude) : null

    return (
        <div className="flex flex-col lg:flex-row w-full gap-6 items-stretch">
            {/* ── Left: Form Container ── */}
            <div className="flex-55 py-6 px-2 lg:pr-8">
                <h3 className="text-xl font-bold text-foreground mb-6">
                    Project Creation Information
                </h3>
                <div className="space-y-5">
                    {/* Project Name */}
                    <div className="space-y-2">
                        <Label htmlFor="projectName" className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-muted-foreground" />
                            Project Name
                        </Label>
                        <Input
                            id="projectName"
                            placeholder="Enter project name"
                            value={formData.projectName}
                            onChange={(e) => updateField("projectName", e.target.value)}
                        />
                        {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
                    </div>

                    {/* System Type */}
                    <div className="space-y-2">
                        <Label htmlFor="systemType" className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            System Type
                        </Label>
                        <Select value={formData.systemType || undefined} onValueChange={(v) => updateField("systemType", v)}>
                            <SelectTrigger id="systemType" className="w-full h-12 rounded-xl border-zinc-200">
                                <SelectValue placeholder={<span className="text-zinc-400 font-normal italic">Select system type</span>} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="roof_mount">Roof Mount</SelectItem>
                                <SelectItem value="ground_mount">Ground Mount</SelectItem>
                                <SelectItem value="car_pool">Car Port</SelectItem>
                                <SelectItem value="both">Both Roof and Ground</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Project Type */}
                    <div className="space-y-2">
                        <Label htmlFor="projectType" className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            Project Type
                        </Label>
                        <Select value={formData.projectType} onValueChange={(v) => updateField("projectType", v)}>
                            <SelectTrigger id="projectType">
                                <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="residential">Residential</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.projectType && <p className="text-sm text-destructive">{errors.projectType}</p>}
                    </div>

                    {/* Project Location */}
                    <div className="space-y-2">
                        <Label htmlFor="projectAddress" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            Project Location
                        </Label>

                        <Tabs defaultValue="address" className="w-full mt-2">
                            

                            <TabsContent value="address" className="space-y-4 mt-4">
                                <AddressAutocomplete
                                    value={formData.projectAddress}
                                    onChange={(value) => updateField("projectAddress", value)}
                                    className="bg-muted/50"
                                />
                            </TabsContent>
                        </Tabs>

                        {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
                    </div>
                </div>
            </div>

            {/* ── Shadow Divider ── */}
            <div
                className="hidden lg:block w-[3px] relative self-stretch -mx-1.5"
                style={{
                    background: "linear-gradient(to bottom, transparent 2%, rgba(0,0,0,0.15) 10%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 90%, transparent 98%)",
                    boxShadow: "6px 0 24px rgba(0,0,0,0.14), 3px 0 10px rgba(0,0,0,0.10)",
                }}
            />

            {/* ── Right: Info Panel Container ── */}
            <div className="flex-45 overflow-hidden shadow-lg">
                <ProjectInfoPanel
                    contractorInfo={{
                        companyName: formData.companyName || "",
                        companyLogo: formData.companyLogo || "",
                        contactName: formData.contactName || "",
                        email: formData.email || "",
                        phone: formData.phone || "",
                        address: formData.companyAddress || "",
                        licenseNo: formData.licenseNo || "",
                        hicNo: formData.hicNo || "",
                    }}
                    projectInfo={{
                        customerName: formData.projectName || "",
                        address: formData.projectAddress || "",
                        systemSize: formData.systemSize || "",
                        acSystemSize: formData.acSystemSize || "",
                        systemType: formData.systemType || "",
                        parcelNumber: formData.parcelNumber || "",
                        utilityNo: formData.utilityNo || "",
                        projectType: formData.projectType || "",
                    }}
                    coordinates={{ lat, lng }}
                />
            </div>
        </div>
    )
}
