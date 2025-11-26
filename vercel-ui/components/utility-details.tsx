"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface UtilityDetailsProps {
    formData: {
        utilityProvider: string
        jurisdiction: string
        useLastProjectValues: boolean
    }
    onUpdateField: (field: string, value: string | boolean) => void
}

export default function UtilityDetails({ formData, onUpdateField }: UtilityDetailsProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="utilityProvider">Utility Provider</Label>
                    <Input
                        id="utilityProvider"
                        placeholder="e.g., Pacific Gas & Electric"
                        value={formData.utilityProvider}
                        onChange={(e) => onUpdateField("utilityProvider", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction / AHJ</Label>
                    <Input
                        id="jurisdiction"
                        placeholder="e.g., City of San Francisco"
                        value={formData.jurisdiction}
                        onChange={(e) => onUpdateField("jurisdiction", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="useLastProjectValues"
                    checked={formData.useLastProjectValues}
                    onCheckedChange={(checked) => onUpdateField("useLastProjectValues", checked === true)}
                />
                <Label htmlFor="useLastProjectValues" className="font-normal cursor-pointer">
                    Use my last project's values
                </Label>
            </div>
        </div>
    )
}
