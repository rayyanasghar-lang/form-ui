"use client"

interface ProjectSummaryProps {
    formData: {
        projectName: string
        projectAddress: string
        projectType: string
        systemSize: string
        systemType: string
        batteryBackup: boolean
        projectFiles: string[]
    }
    componentsCount: number
}

export default function ProjectSummary({ formData, componentsCount }: ProjectSummaryProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Project Info</h4>
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="font-medium">Name:</span> {formData.projectName || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Address:</span> {formData.projectAddress || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Type:</span> {formData.projectType || "—"}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">System Summary</h4>
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="font-medium">Size:</span>{" "}
                            {formData.systemSize ? `${formData.systemSize} kW DC` : "—"}
                        </p>
                        <p>
                            <span className="font-medium">Type:</span> {formData.systemType || "—"}
                        </p>
                        <p>
                            <span className="font-medium">Battery:</span> {formData.batteryBackup ? "Yes" : "No"}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Components</h4>
                    <p className="text-sm">{componentsCount} component(s) added</p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Files Uploaded</h4>
                    <p className="text-sm">{formData.projectFiles.length} file(s)</p>
                </div>
            </div>

            <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                    Review your information above before proceeding to the next step
                </p>
            </div>
        </div>
    )
}
