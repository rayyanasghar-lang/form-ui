"use client"

import FormCard from "../form-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PERMIT_SERVICES = [
    { id: "planset", label: "Planset" },
    { id: "electrical", label: "Electrical Engineering" },
    { id: "rlc", label: "RLC Report" },
    { id: "technical", label: "Technical Review" },
    { id: "fullPackage", label: "Full Project Package" },
]

interface ProjectContactStepProps {
    formData: any
    updateField: (field: string, value: any) => void
    errors: Record<string, string>
    submissionMode: "quick" | "detailed"
    setSubmissionMode: (mode: "quick" | "detailed") => void
    toggleService: (serviceId: string) => void
}

export default function ProjectContactStep({
    formData,
    updateField,
    errors,
    submissionMode,
    setSubmissionMode,
    toggleService,
}: ProjectContactStepProps) {
    return (
        <FormCard title="Project & Contact Information">
            <div className="space-y-6">
                {/* Company Profile */}
                <div>
                    <h3 className="text-sm font-medium mb-4">Company Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => updateField("companyName", e.target.value)}
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Name</Label>
                            <Input
                                id="contactName"
                                value={formData.contactName}
                                onChange={(e) => updateField("contactName", e.target.value)}
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Project Information */}
                <div>
                    <h3 className="text-sm font-medium mb-4">Project Information</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name *</Label>
                            <Input
                                id="projectName"
                                placeholder="Enter project name"
                                value={formData.projectName}
                                onChange={(e) => updateField("projectName", e.target.value)}
                            />
                            {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectAddress">Project Address *</Label>
                            <Input
                                id="projectAddress"
                                placeholder="Start typing address... (Google Places autocomplete)"
                                value={formData.projectAddress}
                                onChange={(e) => updateField("projectAddress", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">📍 Map pin will appear here</p>
                            {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectType">Project Type *</Label>
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
                    </div>
                </div>

                <Separator />

                {/* Permit Services Requested */}
                <div>
                    <h3 className="text-sm font-medium mb-4">Permit Services Requested *</h3>
                    <div className="space-y-3">
                        {PERMIT_SERVICES.map((service) => (
                            <div key={service.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={service.id}
                                    checked={formData.services.includes(service.id)}
                                    onCheckedChange={() => toggleService(service.id)}
                                />
                                <Label htmlFor={service.id} className="font-normal cursor-pointer">
                                    {service.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {errors.services && <p className="text-sm text-destructive mt-2">{errors.services}</p>}
                </div>

                <Separator />

                {/* Submission Type */}
                <div>
                    <h3 className="text-sm font-medium mb-4">Submission Type</h3>
                    <Tabs value={submissionMode} onValueChange={(v) => setSubmissionMode(v as "quick" | "detailed")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="quick">⚡ Quick Upload (Recommended)</TabsTrigger>
                            <TabsTrigger value="detailed">📘 Provide Full Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="quick" className="mt-4">
                            <p className="text-sm text-muted-foreground">
                                Upload your files and we'll handle the rest. Perfect for most projects.
                            </p>
                        </TabsContent>

                        <TabsContent value="detailed" className="mt-4">
                            <p className="text-sm text-muted-foreground">
                                Provide comprehensive project details for complex installations.
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </FormCard>
    )
}
