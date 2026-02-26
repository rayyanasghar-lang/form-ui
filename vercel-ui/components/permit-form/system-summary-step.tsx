"use client"

import FormCard from "../form-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Info, MapPin, Calculator, Calendar, User, Zap, Sun, Battery, Settings2, Power, FileCode, Paperclip, Search } from "lucide-react"
import { EquipmentSearchSelector } from "../equipment-search-selector"
import FileUploader from "../file-uploader"
import SystemComponentsSections, { EquipmentItem } from "../system-components-sections"

interface SystemSummaryStepProps {
    formData: any
    updateField: (field: string, value: any) => void
    errors: Record<string, string>
    submissionMode: "quick" | "provide details"
    components: EquipmentItem[]
    addComponent: (type?: string) => void
    updateComponent: (id: string, field: keyof EquipmentItem, value: any) => void
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
                                min="0"
                                step="0.01"
                                placeholder="e.g., 10.5"
                                value={formData.systemSize}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || Number(val) >= 0) {
                                        updateField("systemSize", val);
                                    }
                                }}
                            />
                            {errors.systemSize && <p className="text-sm text-destructive">{errors.systemSize}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="systemType">System Type *</Label>
                            
                            <Select
                                value={formData.systemType || undefined}
                                onValueChange={(v) => updateField("systemType", v)}
                            >
                                <SelectTrigger
                                    id="systemType"
                                    className="w-full h-12 rounded-xl border-zinc-200"
                                >
                                    <SelectValue placeholder={<span className="text-zinc-400 font-normal italic">Select system type</span>} />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="roof_mount">Roof Mount</SelectItem>
                                    <SelectItem value="ground_mount">Ground Mount</SelectItem>
                                    <SelectItem value="car_pool">Car Pool</SelectItem>
                                    <SelectItem value="both">Both Roof and Ground</SelectItem>
                                </SelectContent>
                            </Select>

                            {errors.systemType && (
                                <p className="text-sm text-destructive">{errors.systemType}</p>
                            )}
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="pvModules">Number of PV Modules (optional)</Label>
                            <Input
                                id="pvModules"
                                type="number"
                                min="0"
                                placeholder="e.g., 24"
                                value={formData.pvModules}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || Number(val) >= 0) {
                                        updateField("pvModules", val);
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inverters">Number of Inverters (optional)</Label>
                            <Input
                                id="inverters"
                                type="number"
                                min="0"
                                placeholder="e.g., 1"
                                value={formData.inverters}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || Number(val) >= 0) {
                                        updateField("inverters", val);
                                    }
                                }}
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
                                    <Info className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
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
                                            min="0"
                                            placeholder="e.g., 2"
                                            value={formData.batteryQty}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || Number(val) >= 0) {
                                                    updateField("batteryQty", val);
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="batteryModel">Battery Make/Model (optional)</Label>
                                        <EquipmentSearchSelector
                                            value={formData.batteryModel}
                                            equipmentId={formData.batteryId}
                                            apiType="battery"
                                            onSelect={(makeModel: string, equipmentId?: string) => {
                                                updateField("batteryModel", makeModel)
                                                if (equipmentId) updateField("batteryId", equipmentId)
                                            }}
                                            placeholder="Search for battery model..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </FormCard>

            {submissionMode === "provide details" && (
                <FormCard title="System Equipment">
                    <SystemComponentsSections
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
