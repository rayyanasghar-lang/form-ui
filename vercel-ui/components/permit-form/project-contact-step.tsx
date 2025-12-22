"use client"

import FormCard from "../form-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Zap, NotebookIcon, Building2, User, Mail, Phone, ClipboardList, MapPin, Briefcase, CheckSquare } from "lucide-react"
import { Service } from "@/app/actions/fetch-services"
import AddressAutocomplete from "../address-autocomplete"

interface ProjectContactStepProps {
    formData: any
// ... (rest of props)


    updateField: (field: string, value: any) => void
    errors: Record<string, string>
    submissionMode: "quick" | "provide details"
    setSubmissionMode: (mode: "quick" | "provide details") => void
    toggleService: (serviceName: string) => void
    availableServices: Service[]
    servicesLoading: boolean
}

export default function ProjectContactStep({
    formData,
    updateField,
    errors,
    submissionMode,
    setSubmissionMode,
    toggleService,
    availableServices,
    servicesLoading,
}: ProjectContactStepProps) {
    return (
        <FormCard title="Project & Contact Information">
            <div className="space-y-6">
                {/* Company Profile */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Company Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                Company Name
                            </Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => updateField("companyName", e.target.value)}
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName" className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Contact Name
                            </Label>
                            <Input
                                id="contactName"
                                value={formData.contactName}
                                onChange={(e) => updateField("contactName", e.target.value)}
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                Phone
                            </Label>
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
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        Project Information
                    </h3>
                    <div className="space-y-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="projectAddress" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                Project Address
                            </Label>
                            <AddressAutocomplete
                                value={formData.projectAddress}
                                onChange={(value) => updateField("projectAddress", value)}
                                className="bg-muted/50"
                            />
                            {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
                        </div>



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
                    </div>
                </div>

                <Separator />

                {/* Permit Services Requested */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-primary" />
                        Permit Services Requested
                    </h3>
                    {servicesLoading ? (
                        <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-9 w-32 rounded-full bg-muted/50 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availableServices.map((service) => (
                                <Badge
                                    key={service.id}
                                    variant={formData.services.includes(service.name) ? "selected" : "selectable"}
                                    onClick={() => toggleService(service.name)}
                                    className="px-4 py-2 text-sm"
                                >
                                    {service.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                    {errors.services && <p className="text-sm text-destructive mt-2">{errors.services}</p>}
                </div>

                <Separator />

                {/* Submission Type */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Submission Type</h3>
                    <Tabs value={submissionMode} onValueChange={(v) => setSubmissionMode(v as "quick" | "provide details")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="quick"><Zap className="mr-2 h-4 w-4" />Quick Upload (Recommended)</TabsTrigger>
                            <TabsTrigger value="provide details"><NotebookIcon className="mr-2 h-4 w-4" /> Provide Full Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="quick" className="mt-4">
                            <p className="text-sm text-muted-foreground">
                                Upload your files and we'll handle the rest. Perfect for most projects.
                            </p>
                        </TabsContent>

                        <TabsContent value="provide details" className="mt-4">
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
