"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface OptionalExtrasProps {
    formData: {
        miracleWattRequired: boolean
        miracleWattNotes: string
        derRlcRequired: boolean
        derRlcNotes: string
        setbackConstraints: boolean
        setbackNotes: string
        siteAccessRestrictions: boolean
        siteAccessNotes: string
        inspectionNotes: boolean
        inspectionNotesText: string
        batterySldRequested: boolean
        batterySldNotes: string
    }
    onUpdateField: (field: string, value: string | boolean) => void
}

export default function OptionalExtras({ formData, onUpdateField }: OptionalExtrasProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Select any additional requirements for your project
            </p>

            {/* MiracleWatt / Monitoring */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="miracleWattRequired"
                        checked={formData.miracleWattRequired}
                        onCheckedChange={(checked) => onUpdateField("miracleWattRequired", checked === true)}
                    />
                    <Label htmlFor="miracleWattRequired" className="font-normal cursor-pointer">
                        MiracleWatt / Monitoring system required
                    </Label>
                </div>
                {formData.miracleWattRequired && (
                    <Input
                        placeholder="Specify monitoring system details"
                        value={formData.miracleWattNotes}
                        onChange={(e) => onUpdateField("miracleWattNotes", e.target.value)}
                        className="ml-6"
                    />
                )}
            </div>

            {/* DER / RLC */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="derRlcRequired"
                        checked={formData.derRlcRequired}
                        onCheckedChange={(checked) => onUpdateField("derRlcRequired", checked === true)}
                    />
                    <Label htmlFor="derRlcRequired" className="font-normal cursor-pointer">
                        DER / RLC required
                    </Label>
                </div>
                {formData.derRlcRequired && (
                    <Input
                        placeholder="Specify DER/RLC requirements"
                        value={formData.derRlcNotes}
                        onChange={(e) => onUpdateField("derRlcNotes", e.target.value)}
                        className="ml-6"
                    />
                )}
            </div>

            {/* Setback Constraints */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="setbackConstraints"
                        checked={formData.setbackConstraints}
                        onCheckedChange={(checked) => onUpdateField("setbackConstraints", checked === true)}
                    />
                    <Label htmlFor="setbackConstraints" className="font-normal cursor-pointer">
                        Setback constraints
                    </Label>
                </div>
                {formData.setbackConstraints && (
                    <Input
                        placeholder="Describe setback requirements"
                        value={formData.setbackNotes}
                        onChange={(e) => onUpdateField("setbackNotes", e.target.value)}
                        className="ml-6"
                    />
                )}
            </div>

            {/* Site Access Restrictions */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="siteAccessRestrictions"
                        checked={formData.siteAccessRestrictions}
                        onCheckedChange={(checked) => onUpdateField("siteAccessRestrictions", checked === true)}
                    />
                    <Label htmlFor="siteAccessRestrictions" className="font-normal cursor-pointer">
                        Site access restrictions
                    </Label>
                </div>
                {formData.siteAccessRestrictions && (
                    <Input
                        placeholder="Describe access restrictions"
                        value={formData.siteAccessNotes}
                        onChange={(e) => onUpdateField("siteAccessNotes", e.target.value)}
                        className="ml-6"
                    />
                )}
            </div>

            {/* Inspection Notes */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="inspectionNotes"
                        checked={formData.inspectionNotes}
                        onCheckedChange={(checked) => onUpdateField("inspectionNotes", checked === true)}
                    />
                    <Label htmlFor="inspectionNotes" className="font-normal cursor-pointer">
                        Inspection notes
                    </Label>
                </div>
                {formData.inspectionNotes && (
                    <Input
                        placeholder="Add inspection-related notes"
                        value={formData.inspectionNotesText}
                        onChange={(e) => onUpdateField("inspectionNotesText", e.target.value)}
                        className="ml-6"
                    />
                )}
            </div>

            {/* Battery SLD */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="batterySldRequested"
                        checked={formData.batterySldRequested}
                        onCheckedChange={(checked) => onUpdateField("batterySldRequested", checked === true)}
                    />
                    <Label htmlFor="batterySldRequested" className="font-normal cursor-pointer">
                        Battery SLD requested
                    </Label>
                </div>
                {formData.batterySldRequested && (
                    <Input
                        placeholder="Battery SLD specifications"
                        value={formData.batterySldNotes}
                        onChange={(e) => onUpdateField("batterySldNotes", e.target.value)}
                        className="ml-6"
                    />
                )}
            </div>
        </div>
    )
}
