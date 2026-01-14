"use client"

import FormCard from "../form-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Zap, NotebookIcon, Building2, User, Mail, Phone, ClipboardList, MapPin, Briefcase, CheckSquare, Loader2, CloudSun, Database, Search, CheckCircle2, Activity } from "lucide-react"
import { Service } from "@/app/actions/fetch-services"
import AddressAutocomplete from "../address-autocomplete"

interface ProjectContactStepProps {
    formData: any
// ... (rest of props)

    updateField: (field: string, value: any) => void
    errors: Record<string, string>
    submissionMode: "quick" | "provide details"
    setSubmissionMode: (mode: "quick" | "provide details") => void
    toggleService: (serviceName: string) => void
    availableServices: Service[]
    servicesLoading: boolean
    scrapingStatus?: "idle" | "scraping" | "completed" | "error"
    onStartScraping: () => void
    weatherStations?: any[]
    weatherLoading?: boolean
}

export default function ProjectContactStep({
    formData,
    updateField,
    errors,
    submissionMode,
    setSubmissionMode,
    toggleService,
    availableServices,
    servicesLoading,
    scrapingStatus = "idle",
    onStartScraping,
    weatherStations = [],
    weatherLoading = false,
}: ProjectContactStepProps) {
    return (
        <FormCard title="Project & Contact Information">
            <div className="space-y-6">
                
                {/* Submission Type */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Submission Type</h3>
                    <Tabs value={submissionMode} onValueChange={(v) => setSubmissionMode(v as "quick" | "provide details")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="quick" className="text-zinc-700! data-[state=active]:text-white!"><Zap className="mr-2 h-4 w-4" />Quick Upload (Recommended)</TabsTrigger>
                            <TabsTrigger value="provide details" className="text-zinc-700! data-[state=active]:text-white!"><NotebookIcon className="mr-2 h-4 w-4" /> Provide Full Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="quick" className="mt-4">
                            <p className="text-sm text-muted-foreground">
                                Upload your files and we'll handle the rest. Perfect for most projects.
                            </p>
                        </TabsContent>

                        <TabsContent value="provide details" className="mt-4">
                            <p className="text-sm text-muted-foreground">
                                Provide comprehensive project details for complex installations.
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
                {/* Project Information */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        {/* <ClipboardList className="w-5 h-5 text-primary" /> */}
                        Project Information
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName" className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                                Project Name
                            </Label>
                            <Input
                                id="projectName"
                                placeholder="Enter project name"
                                value={formData.projectName}
                                onChange={(e) => updateField("projectName", e.target.value)}
                            />
                            {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="systemType" className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-muted-foreground" />
                                System Type
                            </Label>
                            <Select value={formData.systemType || undefined} onValueChange={(v) => updateField("systemType", v)}>
                                <SelectTrigger id="systemType" className="w-full h-12 rounded-xl border-zinc-200">
                                    <SelectValue placeholder={<span className="text-zinc-400 font-normal italic">Select system type</span>} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="roof_mount">Roof Mount</SelectItem>
                                    <SelectItem value="ground_mount">Ground Mount</SelectItem>
                                    <SelectItem value="car_pool">Car Pool</SelectItem>
                                    <SelectItem value="both">Both Roof and Ground</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectAddress" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                Project Location
                            </Label>
                            
                            <Tabs defaultValue="address" className="w-full mt-2">
                                <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/50 p-1 text-zinc-500">
                                    <TabsTrigger value="address" className="text-[10px] uppercase font-bold tracking-wider text-zinc-700! data-[state=active]:text-white!">Address Search</TabsTrigger>
                                    
                                    <TabsTrigger value="coords" className="text-[10px] uppercase font-bold tracking-wider text-zinc-700! data-[state=active]:text-white! ">Coordinates</TabsTrigger>
                                </TabsList>

                                <TabsContent value="address" className="space-y-4 mt-4">
                                    <AddressAutocomplete
                                        value={formData.projectAddress}
                                        onChange={(value) => updateField("projectAddress", value)}
                                        className="bg-muted/50"
                                    />
                                </TabsContent>

                                <TabsContent value="coords" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Latitude</Label>
                                            <Input 
                                                type="text" 
                                                placeholder="e.g. 34.0522" 
                                                value={formData.latitude}
                                                onChange={(e) => updateField("latitude", e.target.value)}
                                                className="bg-muted/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Longitude</Label>
                                            <Input 
                                                type="text" 
                                                placeholder="e.g. -118.2437" 
                                                value={formData.longitude}
                                                onChange={(e) => updateField("longitude", e.target.value)}
                                                className="bg-muted/50"
                                            />
                                        </div>
                                    </div>
                                    {formData.projectAddress && (
                                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-xs font-medium text-green-700">Resolved to: {formData.projectAddress}</span>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {errors.projectAddress && <p className="text-sm text-destructive">{errors.projectAddress}</p>}
                            
                            {/* Manual Scraper Trigger */}
                            {(formData.projectAddress || (formData.latitude && formData.longitude)) && scrapingStatus === "idle" && (
                                <button
                                    type="button"
                                    onClick={onStartScraping}
                                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 font-medium text-sm group"
                                >
                                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Fetch Property Intelligence
                                </button>
                            )}

                            {/* Scraped Data display */}
                            {/* Scraped Data display (Separate Boxes) */}
                <Separator />
                
                {/* Property Intelligence (Scraped & Weather Data) */}
                <div className="space-y-6 mt-6">
                    {/* Live Analysis Status Bar (Always show while anything is loading) */}
                    {(scrapingStatus === "scraping" || weatherLoading) && (
                        <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                                    <Activity className="h-4 w-4 animate-pulse" />
                                    Live Property Analysis
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground animate-pulse font-medium uppercase tracking-wider">
                                        {scrapingStatus === "scraping" && weatherLoading ? "Dual-Stream Syncing..." : "Syncing Data Streams..."}
                                    </span>
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Weather Analysis Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                        {weatherLoading ? <Search className="h-3 w-3 text-primary animate-pulse" /> : <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                        Nearby Weather (NWS)
                                    </div>
                                    <div className="pl-5">
                                        {weatherStations.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {weatherStations.slice(0, 3).map(s => (
                                                    <Badge key={s.id} variant="secondary" className={cn("text-[9px] h-4 px-1.5 font-medium bg-background/50", weatherLoading && "animate-pulse")}>
                                                        {s.id}
                                                    </Badge>
                                                ))}
                                                {weatherStations.length > 3 && <span className="text-[9px] text-muted-foreground">+{weatherStations.length - 3}</span>}
                                                {weatherLoading && <Loader2 className="h-2.5 w-2.5 animate-spin text-primary/40 ml-1" />}
                                            </div>
                                        ) : weatherLoading ? (
                                            <p className="text-[10px] text-muted-foreground italic">Scanning frequency bands...</p>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground italic">Syncing stations...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Scraper Analysis Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                        {scrapingStatus === "scraping" ? <Database className="h-3 w-3 text-primary animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                        Jurisdiction Records
                                    </div>
                                    <div className="pl-5 flex flex-col gap-1.5">
                                        {[
                                            { name: "Regrid", key: "regrid" },
                                            { name: "ASCE 7-16", key: "asce716" },
                                            { name: "ASCE 7-22", key: "asce" },
                                            { name: "Zillow Data", key: "zillow" }
                                        ].map(source => {
                                            const isLoaded = !!formData.sources?.[source.key];
                                            return (
                                                <div key={source.key} className="flex items-center justify-between text-[10px]">
                                                    <span className={cn("font-medium", isLoaded ? "text-green-600" : "text-muted-foreground")}>
                                                        {source.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={cn("italic", isLoaded ? "text-green-600/70" : "text-muted-foreground/60")}>
                                                            {isLoaded ? "Synchronized" : "Connecting..."}
                                                        </span>
                                                        {isLoaded ? (
                                                            <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                                                        ) : (
                                                            <Loader2 className="h-2.5 w-2.5 animate-spin text-primary/40" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Sections (Pop in as data arrives) */}
                    {(Object.keys(formData.sources || {}).length > 0 || weatherStations.length > 0) && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between border-b pb-2 mb-2">
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                    Property Intelligence Report
                                </h4>
                                {(!weatherLoading && scrapingStatus !== "scraping") && (
                                    <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/20 px-2 py-0 animate-in zoom-in-50">VERIFIED</Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {/* Regrid Card */}
                                {formData.sources?.regrid && (
                                    <div className="border rounded-md bg-card/50 p-3 shadow-sm group hover:border-primary/20 transition-all animate-in zoom-in-95 fill-mode-both">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">Regrid</Badge>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Owner</span>
                                                <span className="font-medium truncate" title={formData.sources.regrid.owner}>{formData.sources.regrid.owner || "-"}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Parcel ID</span>
                                                <span className="font-medium truncate" title={formData.sources.regrid.parcelNumber}>{formData.sources.regrid.parcelNumber || "-"}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Lot Size</span>
                                                <span className="font-medium">{formData.sources.regrid.lotSize || "-"}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Land Use</span>
                                                <span className="font-medium truncate" title={formData.sources.regrid.landUse}>{formData.sources.regrid.landUse || "-"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ASCE 7-16 Card */}
                                {formData.sources?.asce716 && (
                                    <div className="border rounded-md bg-card/50 p-3 shadow-sm group hover:border-primary/20 transition-all animate-in zoom-in-95 fill-mode-both">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] uppercase font-bold tracking-wider">ASCE 7-16</Badge>
                                            <span className="text-[10px] text-muted-foreground ml-auto uppercase font-medium tracking-tighter">Loads</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Wind</span>
                                                <span className="font-medium">{formData.sources.asce716.windSpeed ? `${formData.sources.asce716.windSpeed}` : "-"}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Snow</span>
                                                <span className="font-medium">{formData.sources.asce716.snowLoad ? `${formData.sources.asce716.snowLoad}` : "-"}</span>
                                            </div>
                                            <div className="pt-2 text-[10px] text-muted-foreground italic">
                                                Legacy structural constants.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ASCE 7-22 Card */}
                                {formData.sources?.asce && (
                                    <div className="border rounded-md bg-card/50 p-3 shadow-sm group hover:border-primary/20 transition-all animate-in zoom-in-95 fill-mode-both">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider">ASCE 7-22</Badge>
                                            <span className="text-[10px] text-muted-foreground ml-auto uppercase font-medium tracking-tighter">Loads</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Wind</span>
                                                <span className="font-medium">{formData.sources.asce.windSpeed ? `${formData.sources.asce.windSpeed}` : "-"}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Snow</span>
                                                <span className="font-medium">{formData.sources.asce.snowLoad ? `${formData.sources.asce.snowLoad}` : "-"}</span>
                                            </div>
                                            <div className="pt-2 text-[10px] text-muted-foreground italic">
                                                Modern structural standards.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Zillow Card */}
                                {formData.sources?.zillow && (
                                    <div className="border rounded-md bg-card/50 p-3 shadow-sm group hover:border-primary/20 transition-all animate-in zoom-in-95 fill-mode-both">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] uppercase font-bold tracking-wider">Zillow</Badge>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Parcel</span>
                                                <span className="font-medium truncate">{formData.sources.zillow.parcelNumber || "-"}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_1fr]">
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Lot Size</span>
                                                <span className="font-medium">{formData.sources.zillow.lotSize || "-"}</span>
                                            </div>
                                            {formData.sources.zillow.interiorArea && (
                                                <div className="grid grid-cols-[80px_1fr]">
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Interior</span>
                                                    <span className="font-medium truncate">{formData.sources.zillow.interiorArea}</span>
                                                </div>
                                            )}
                                            {formData.sources.zillow.structureArea && (
                                                <div className="grid grid-cols-[80px_1fr]">
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Structure</span>
                                                    <span className="font-medium truncate">{formData.sources.zillow.structureArea}</span>
                                                </div>
                                            )}
                                            {formData.sources.zillow.yearBuilt && (
                                                <div className="grid grid-cols-[80px_1fr]">
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Built</span>
                                                    <span className="font-medium">{formData.sources.zillow.yearBuilt}</span>
                                                </div>
                                            )}
                                            {formData.sources.zillow.newConstruction !== null && formData.sources.zillow.newConstruction !== undefined && (
                                                <div className="grid grid-cols-[80px_1fr]">
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">New Const</span>
                                                    <span className="font-medium">{formData.sources.zillow.newConstruction ? "Yes" : "No"}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 text-[10px] text-muted-foreground italic">
                                                Secondary cross-verification.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Weather Stations Grid (Show as soon as any stations exist) */}
                            {weatherStations.length > 0 && (
                                <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-2 duration-700">
                                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CloudSun className="h-3 w-3" />
                                        Nearby Observatories (NWS)
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {weatherStations.map((station) => (
                                            <div key={station.id} className="border rounded-md bg-card/30 p-2.5 shadow-sm group hover:border-primary/20 transition-all hover:bg-muted/50 animate-in zoom-in-95 fill-mode-both">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-bold text-primary">{station.id}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        {(station.distance / 1609.34).toFixed(1)}mi
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-[11px] leading-tight line-clamp-1 text-foreground/90" title={station.name}>
                                                        {station.name}
                                                    </div>
                                                    <div className="text-[9px] text-muted-foreground flex items-center justify-between italic">
                                                        <span>{station.timeZone.split('/').pop()?.replace('_', ' ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                            {/* Fallback Merged View (Hidden if sources present, keeps backward compat if needed temporarily) */}
                            {!formData.sources && (formData.lotSize || formData.parcelNumber) && (
                                <div className="mt-4 p-4 border rounded-md bg-muted/30 animate-in fade-in-50">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        Property Data (Merged)
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Owner</Label>
                                            <div className="font-medium text-sm truncate">{formData.owner || "-"}</div>
                                        </div>
                                        {/* ... other fields ... */}
                                    </div>
                                </div>
                            )}
                        </div>



                        <div className="space-y-2">
                            <Label htmlFor="projectType" className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                Project Type
                            </Label>
                            <Select value={formData.projectType} onValueChange={(v) => updateField("projectType", v)}>
                                <SelectTrigger id="projectType">
                                    <SelectValue placeholder="Select project type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.projectType && <p className="text-sm text-destructive">{errors.projectType}</p>}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Permit Services Requested */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-primary" />
                        Permit Services Requested
                    </h3>
                    {servicesLoading ? (
                        <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-9 w-32 rounded-full bg-muted/50 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availableServices.map((service) => (
                                <Badge
                                    key={service.id}
                                    variant={formData.services.includes(service.name) ? "selected" : "selectable"}
                                    onClick={() => toggleService(service.name)}
                                    className="px-4 py-2 text-sm border border-primary/20 data-[state=selected]:border-primary"
                                >
                                    {service.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                    {errors.services && <p className="text-sm text-destructive mt-2">{errors.services}</p>}
                </div>

            </div>
        </FormCard>
    )
}
