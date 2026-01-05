"use client"

import FormCard from "../form-card"
import { Separator } from "@/components/ui/separator"
import FileUploader from "../file-uploader"

interface UploadsStepProps {
    formData: any
    updateField: (field: string, value: any) => void
    setFilesToUpload: (files: File[]) => void
}

export default function UploadsStep({ formData, updateField, setFilesToUpload }: UploadsStepProps) {
    return (
        <FormCard title="Required Uploads">
            <div className="space-y-6">
                {/* Upload Checklist */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Upload Checklist</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-0.5">1.</span>
                            <span>Proposed Layout</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-0.5">2.</span>
                            <span>Electric Utility Bill</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-0.5">3.</span>
                            <span>Roof Pictures</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-0.5">4.</span>
                            <span>Attic Pictures</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-0.5">5.</span>
                            <span>Electric Pictures</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-0.5">6.</span>
                            <span>Property Sketch <span className="text-muted-foreground">(mentioning location of MSP, meter, roof vent, chimney)</span></span>
                        </div>
                    </div>
                </div>

                <Separator />

                <FileUploader
                    label="Upload all project files here"
                    description="We automatically categorize your files. Accepted: images, PDFs, ZIPs, CSV, DOCX, etc."
                    onFilesSelected={(files) => {
                        // Update the actual File objects for upload
                        setFilesToUpload(files)
                    }}
                />
                <p className="text-xs text-muted-foreground">
                    💡 Tip: You can drag and drop multiple files at once
                </p>
            </div>
        </FormCard>
    )
}
