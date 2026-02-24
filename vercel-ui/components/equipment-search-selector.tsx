"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EquipmentSearchItem {
    uuid: string
    brandName: string
    model: string
    display_label: string
    power?: number | string
    voltage?: number | string
    efficiency?: number | string
}

interface EquipmentSearchSelectorProps {
    value: string
    equipmentId?: string
    apiType: string
    onSelect: (makeModel: string, equipmentId?: string) => void
    onSelectFull?: (item: EquipmentSearchItem) => void
    placeholder?: string
    className?: string
    frequentItems?: { label: string, uuid?: string }[]
}

export function EquipmentSearchSelector({ 
    value, 
    equipmentId, 
    apiType, 
    onSelect,
    onSelectFull,
    placeholder = "Search or enter model...",
    className,
    frequentItems = []
}: EquipmentSearchSelectorProps) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [options, setOptions] = useState<EquipmentSearchItem[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setOptions([])
            return
        }

        const timer = setTimeout(async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/equipment/search?type=${apiType}&q=${encodeURIComponent(searchQuery)}`)
                if (res.ok) {
                    const json = await res.json()
                    if (json.status === "success" && Array.isArray(json.data)) {
                        setOptions(json.data)
                    }
                }
            } catch (error) {
                console.error("Equipment search error:", error)
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, apiType])

    const handleSelect = (item: EquipmentSearchItem) => {
        onSelect(item.display_label, item.uuid)
        onSelectFull?.(item)
        setOpen(false)
        setSearchQuery("")
    }

    const handleManualInput = (inputValue: string) => {
        onSelect(inputValue, undefined)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-10 w-full justify-between rounded-lg border-zinc-200 bg-white font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate">
                        {value || placeholder}
                    </span>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                        {equipmentId && (
                            <Check className="h-3 w-3 text-green-500" />
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
                <Command shouldFilter={false}>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            placeholder="Search verified models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    {frequentItems.length > 0 && searchQuery.length < 1 && (
                        <div className="p-3 border-b bg-zinc-50/50">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Frequent Models</p>
                            <div className="flex flex-wrap gap-2">
                                {frequentItems.map((item) => (
                                    <Badge 
                                        key={item.label}
                                        variant="outline" 
                                        className="cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all rounded-lg py-1 px-3 bg-white text-zinc-600 border-zinc-200"
                                        onClick={() => {
                                            onSelect(item.label, item.uuid)
                                            setOpen(false)
                                        }}
                                    >
                                        {item.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    <CommandList>
                        {isLoading && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                            </div>
                        )}
                        
                        {!isLoading && searchQuery.length >= 2 && options.length === 0 && (
                            <CommandEmpty className="py-6 text-center text-sm">
                                <p className="text-muted-foreground">No verified models found.</p>
                                <Button
                                    variant="link"
                                    className="mt-2 h-auto p-0 text-primary"
                                    onClick={() => {
                                        handleManualInput(searchQuery)
                                        setOpen(false)
                                    }}
                                >
                                    Use "{searchQuery}" as custom model
                                </Button>
                            </CommandEmpty>
                        )}
                        
                        {!isLoading && options.length > 0 && (
                            <CommandGroup heading="Verified Models">
                                {options.map((item) => (
                                    <CommandItem
                                        key={item.uuid}
                                        value={item.uuid}
                                        onSelect={() => handleSelect(item)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                equipmentId === item.uuid ? "opacity-100 text-primary" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-zinc-900">{item.display_label}</span>
                                                {item.power && (
                                                    <Badge variant="outline" className="h-4 px-1.5 text-[10px] bg-primary/5 text-primary border-primary/20">
                                                        {item.power}{typeof item.power === 'number' ? 'W' : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                                {item.brandName || "Verified Brand"} • Verified Component
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        
                        {searchQuery.length < 2 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                <Search className="mx-auto h-8 w-8 opacity-30 mb-2" />
                                <p>Type at least 2 characters to search</p>
                                <p className="text-xs mt-1">or enter a custom model name</p>
                            </div>
                        )}
                    </CommandList>
                    
                    {/* Manual entry option */}
                    {searchQuery.length >= 2 && options.length > 0 && (
                        <div className="border-t p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs text-muted-foreground"
                                onClick={() => {
                                    handleManualInput(searchQuery)
                                    setOpen(false)
                                }}
                            >
                                <Plus className="mr-2 h-3 w-3" />
                                Use "{searchQuery}" as custom model
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    )
}
