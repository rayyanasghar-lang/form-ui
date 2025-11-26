"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import FileUploader from "./file-uploader"

interface ElectricalDetailsProps {
    formData: {
        mainPanelSize: string
        busRating: string
        mainBreaker: string
        pvBreakerLocation: string
        designForMe: boolean
        meterLocation: string
        serviceEntranceType: string
        subpanelDetails: string
    }
    onUpdateField: (field: string, value: string | boolean) => void
    onFileUpload: (field: string, files: string[]) => void
}

export default function ElectricalDetails({ formData, onUpdateField, onFileUpload }: ElectricalDetailsProps) {
    const [showAdvanced, setShowAdvanced] = useState(false)

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mainPanelSize">Main Panel Size (A)</Label>
                    <Input
                        id="mainPanelSize"
                        type="number"
                        placeholder="e.g., 200"
                        value={formData.mainPanelSize}
                        onChange={(e) => onUpdateField("mainPanelSize", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="busRating">Bus Rating (A)</Label>
                    <Input
                        id="busRating"
                        type="number"
                        placeholder="e.g., 200"
                        value={formData.busRating}
                        onChange={(e) => onUpdateField("busRating", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mainBreaker">Main Breaker (A)</Label>
                    <Input
                        id="mainBreaker"
                        type="number"
                        placeholder="e.g., 200"
                        value={formData.mainBreaker}
                        onChange={(e) => onUpdateField("mainBreaker", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="pvBreakerLocation">PV Breaker Location</Label>
                <Select value={formData.pvBreakerLocation} onValueChange={(v) => onUpdateField("pvBreakerLocation", v)}>
                    <SelectTrigger id="pvBreakerLocation">
                        <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="opposite">Opposite</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            <div className="space-y-4">
                <Label>One-line Diagram Provided?</Label>
                <div className="space-y-3">
                    <FileUploader
                        label=""
                        description="Upload one-line diagram if available"
                        onFilesSelected={(files) => onFileUpload("oneLineDiagram", files.map((f) => f.name))}
                    />
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="designForMe"
                            checked={formData.designForMe}
                            onCheckedChange={(checked) => onUpdateField("designForMe", checked === true)}
                        />
                        <Label htmlFor="designForMe" className="font-normal cursor-pointer">
                            Please design for me
                        </Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Advanced Electrical (Collapsible) */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                        <span className="text-sm font-medium">Advanced Electrical Details</span>
                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="meterLocation">Meter Location</Label>
                        <Input
                            id="meterLocation"
                            placeholder="e.g., Side of house, near garage"
                            value={formData.meterLocation}
                            onChange={(e) => onUpdateField("meterLocation", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serviceEntranceType">Service Entrance Type</Label>
                        <Input
                            id="serviceEntranceType"
                            placeholder="e.g., Overhead, Underground"
                            value={formData.serviceEntranceType}
                            onChange={(e) => onUpdateField("serviceEntranceType", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subpanelDetails">Subpanel Details</Label>
                        <Textarea
                            id="subpanelDetails"
                            placeholder="Describe any subpanels..."
                            className="resize-none"
                            rows={2}
                            value={formData.subpanelDetails}
                            onChange={(e) => onUpdateField("subpanelDetails", e.target.value)}
                        />
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
