"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

const COMPONENT_TYPES = [
    "Module",
    "Inverter",
    "Optimizer",
    "Monitoring",
    "Racking",
    "Battery",
    "AC Disconnect",
    "Other",
]

export interface Component {
    id: string
    type: string
    makeModel: string
    qty: string
    attachment: string[]
    notes: string
}

interface SystemComponentsTableProps {
    components: Component[]
    onAddComponent: () => void
    onUpdateComponent: (id: string, field: keyof Component, value: string | string[]) => void
    onRemoveComponent: (id: string) => void
}

export default function SystemComponentsTable({
    components,
    onAddComponent,
    onUpdateComponent,
    onRemoveComponent,
}: SystemComponentsTableProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Add all system components with their specifications
            </p>

            {components.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Component Type</TableHead>
                                <TableHead>Make/Model</TableHead>
                                <TableHead className="w-[100px]">Qty</TableHead>
                                <TableHead className="w-[150px]">Attachment</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {components.map((component) => (
                                <TableRow key={component.id}>
                                    <TableCell>
                                        <Select
                                            value={component.type}
                                            onValueChange={(v) => onUpdateComponent(component.id, "type", v)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COMPONENT_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type.toLowerCase()}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="e.g., Tesla Powerwall 2"
                                            value={component.makeModel}
                                            onChange={(e) => onUpdateComponent(component.id, "makeModel", e.target.value)}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            value={component.qty}
                                            onChange={(e) => onUpdateComponent(component.id, "qty", e.target.value)}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="h-9 w-full">
                                            Upload
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Optional notes"
                                            value={component.notes}
                                            onChange={(e) => onUpdateComponent(component.id, "notes", e.target.value)}
                                            className="h-9"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveComponent(component.id)}
                                            className="h-9 w-9 p-0"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onAddComponent} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Component
                </Button>
            </div>
        </div>
    )
}
