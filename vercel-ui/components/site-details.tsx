"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FileUploader from "./file-uploader"

interface SiteDetailsProps {
    systemType: string
    formData: {
        roofMaterial: string
        roofPitch: string
        numberOfArrays: string
        useRoofImages: boolean
        groundMountType: string
        foundationType: string
        rowCount: string
        moduleCountPerRow: string
        structuralNotes: string
        lotSize: string
        parcelNumber: string
        windSpeed: string
        snowLoad: string
    }
    onUpdateField: (field: string, value: string | boolean) => void
    onFileUpload: (field: string, files: string[]) => void
}

export default function SiteDetails({ systemType, formData, onUpdateField, onFileUpload }: SiteDetailsProps) {
    const isRoof = systemType === "roof_mount" || systemType === "both"
    const isGround = systemType === "ground_mount" || systemType === "both" || systemType === "car_pool"

    return (
        <div className="space-y-8">
            {isRoof && (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        Roof Details {systemType === "both" && <span className="text-[10px] text-primary font-black">(Part 1)</span>}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roofMaterial">Roof Material</Label>
                            <Select value={formData.roofMaterial} onValueChange={(v) => onUpdateField("roofMaterial", v)}>
                                <SelectTrigger id="roofMaterial">
                                    <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asphalt">Asphalt Shingle</SelectItem>
                                    <SelectItem value="tile">Tile</SelectItem>
                                    <SelectItem value="metal">Metal</SelectItem>
                                    <SelectItem value="tpo">TPO</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="roofPitch">Roof Pitch</Label>
                            <Select value={formData.roofPitch} onValueChange={(v) => onUpdateField("roofPitch", v)}>
                                <SelectTrigger id="roofPitch">
                                    <SelectValue placeholder="Select pitch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15°</SelectItem>
                                    <SelectItem value="20">20°</SelectItem>
                                    <SelectItem value="25">25°</SelectItem>
                                    <SelectItem value="30">30°</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numberOfArrays">Number of Arrays</Label>
                            <Input
                                id="numberOfArrays"
                                type="number"
                                placeholder="e.g., 2"
                                value={formData.numberOfArrays}
                                onChange={(e) => onUpdateField("numberOfArrays", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="useRoofImages"
                            checked={formData.useRoofImages}
                            onCheckedChange={(checked) => onUpdateField("useRoofImages", checked === true)}
                        />
                        <Label htmlFor="useRoofImages" className="font-normal cursor-pointer">
                            I don't know — use my roof images
                        </Label>
                    </div>
                </div>
            )}

            {isRoof && isGround && <Separator />}

            {isGround && (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        {systemType === "car_pool" ? "Car Pool (Carport) Details" : "Ground Mount Details"} 
                        {systemType === "both" && <span className="text-[10px] text-primary font-black">(Part 2)</span>}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="groundMountType">{systemType === "car_pool" ? "Structure Type" : "Ground Mount Type"}</Label>
                            <Select value={formData.groundMountType} onValueChange={(v) => onUpdateField("groundMountType", v)}>
                                <SelectTrigger id="groundMountType">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ironridge">IronRidge</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                    <SelectItem value="steel">Steel</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="foundationType">Foundation Type</Label>
                            <Select value={formData.foundationType} onValueChange={(v) => onUpdateField("foundationType", v)}>
                                <SelectTrigger id="foundationType">
                                    <SelectValue placeholder="Select foundation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="concrete">Concrete Pier</SelectItem>
                                    <SelectItem value="helical">Helical Pile</SelectItem>
                                    <SelectItem value="ballast">Ballast</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rowCount">Row Count</Label>
                            <Input
                                id="rowCount"
                                type="number"
                                placeholder="e.g., 3"
                                value={formData.rowCount}
                                onChange={(e) => onUpdateField("rowCount", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="moduleCountPerRow">Module Count per Row</Label>
                            <Input
                                id="moduleCountPerRow"
                                type="number"
                                placeholder="e.g., 8"
                                value={formData.moduleCountPerRow}
                                onChange={(e) => onUpdateField("moduleCountPerRow", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="structuralNotes">Structural Notes (optional)</Label>
                        <Textarea
                            id="structuralNotes"
                            placeholder="Any structural considerations..."
                            className="resize-none"
                            rows={2}
                            value={formData.structuralNotes}
                            onChange={(e) => onUpdateField("structuralNotes", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Upload Structural or Layout Sketch</Label>
                        <FileUploader
                            label=""
                            description={systemType === "car_pool" ? "Upload car pool layout or structural details" : "Upload ground mount layout or structural details"}
                            onFilesSelected={(files) => onFileUpload("structuralSketch", files.map((f) => f.name))}
                        />
                    </div>
                </div>
            )}

            {!isRoof && !isGround && (
                <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-sm text-muted-foreground font-medium">
                        Please select a system type to configure site details.
                    </p>
                </div>
            )}
        </div>
    )
}
