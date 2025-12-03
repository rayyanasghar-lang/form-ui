"use client"

import FormCard from "../form-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface GeneralNotesStepProps {
    formData: any
    updateField: (field: string, value: any) => void
}

export default function GeneralNotesStep({ formData, updateField }: GeneralNotesStepProps) {
    return (
        <FormCard title="General Notes">
            <div className="space-y-2">
                <Label htmlFor="generalNotes">Anything we should know?</Label>
                <Textarea
                    id="generalNotes"
                    placeholder="Site access, special requirements, HOA concerns, microinverters required, setback requirements, equipment preferences, etc."
                    className="resize-none min-h-[120px]"
                    value={formData.generalNotes}
                    onChange={(e) => updateField("generalNotes", e.target.value)}
                />
            </div>
        </FormCard>
    )
}
