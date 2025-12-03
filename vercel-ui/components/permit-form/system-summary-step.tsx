"use client"

import FormCard from "../form-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Info } from "lucide-react"
import FileUploader from "../file-uploader"
import SystemComponentsTable, { Component } from "../system-components-table"

interface SystemSummaryStepProps {
    formData: any
    updateField: (field: string, value: any) => void
    errors: Record<string, string>
    submissionMode: "quick" | "detailed"
    components: Component[]
    addComponent: () => void
    updateComponent: (id: string, field: keyof Component, value: any) => void
    removeComponent: (id: string) => void
}

export default function SystemSummaryStep({
    formData,
    updateField,
    errors,
    submissionMode,
    components,
    addComponent,
    updateComponent,
    removeComponent,
}: SystemSummaryStepProps) {
    return (
        <>
            <FormCard title="System Summary">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="systemSize">System Size (kW DC) *</Label>
                            <Input
                                id="systemSize"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 10.5"
                                value={formData.systemSize}
                                onChange={(e) => updateField("systemSize", e.target.value)}
                            />
                            {errors.systemSize && <p className="text-sm text-destructive">{errors.systemSize}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="systemType">System Type *</Label>
                            <Select value={formData.systemType} onValueChange={(v) => updateField("systemType", v)}>
                                <SelectTrigger id="systemType">
                                    <SelectValue placeholder="Select system type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="roofmount">Roof Mount</SelectItem>
                                    <SelectItem value="groundmount">Ground Mount</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.systemType && <p className="text-sm text-destructive">{errors.systemType}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pvModules">Number of PV Modules (optional)</Label>
                            <Input
                                id="pvModules"
                                type="number"
                                placeholder="e.g., 24"
                                value={formData.pvModules}
                                onChange={(e) => updateField("pvModules", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inverters">Number of Inverters (optional)</Label>
                            <Input
                                id="inverters"
                                type="number"
                                placeholder="e.g., 1"
                                value={formData.inverters}
                                onChange={(e) => updateField("inverters", e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Battery Backup */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="batteryBackup" className="text-base">Battery Backup?</Label>
                                <p className="text-sm text-muted-foreground">Enable if project includes battery storage</p>
                            </div>
                            <Switch
                                id="batteryBackup"
                                checked={formData.batteryBackup}
                                onCheckedChange={(checked) => updateField("batteryBackup", checked)}
                            />
                        </div>

                        {formData.batteryBackup && (
                            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Battery engineering add-on ($100) required.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="batteryQty">Battery Quantity</Label>
                                        <Input
                                            id="batteryQty"
                                            type="number"
                                            placeholder="e.g., 2"
                                            value={formData.batteryQty}
                                            onChange={(e) => updateField("batteryQty", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="batteryModel">Battery Make/Model (optional)</Label>
                                        <Input
                                            id="batteryModel"
                                            placeholder="e.g., Tesla Powerwall 2"
                                            value={formData.batteryModel}
                                            onChange={(e) => updateField("batteryModel", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Battery Closeup Image (optional)</Label>
                                    <FileUploader
                                        label=""
                                        description="Upload battery image"
                                        onFilesSelected={(files) =>
                                            updateField(
                                                "batteryImage",
                                                files.map((f) => f.name),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </FormCard>

            {submissionMode === "detailed" && (
                <FormCard title="System Components">
                    <SystemComponentsTable
                        components={components}
                        onAddComponent={addComponent}
                        onUpdateComponent={updateComponent}
                        onRemoveComponent={removeComponent}
                    />
                </FormCard>
            )}
        </>
    )
}
