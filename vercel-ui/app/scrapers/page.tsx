"use client"

import React, { useState } from "react"
import { Search, Loader2, Info, Building, Home, Wind, Snowflake, MapPin, Database, CloudSun, Copy, Check, Map, Plug } from "lucide-react"
import AddressAutocomplete from "@/components/address-autocomplete"
import { 
  scrapeAHJAction,
  scrapeUtilityAction
} from "@/app/actions/scrape-service"
import { geocodeAddress, fetchNearbyStations } from "@/app/actions/weather-service"
import { fetchAshraeData, AshraeRecord } from "@/app/actions/ashrae-service"
import { fetchProjectsAction } from "@/app/actions/project-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ScrapersPage() {
  const [address, setAddress] = useState("")
  const [regridEmail, setRegridEmail] = useState("")
  const [regridPassword, setRegridPassword] = useState("")
  
  // Individual loading states
  const [loading, setLoading] = useState(false)
  const [zillowLoading, setZillowLoading] = useState(false)
  const [regridLoading, setRegridLoading] = useState(false)
  const [asce716Loading, setAsce716Loading] = useState(false)
  const [asce722Loading, setAsce722Loading] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [ahjLoading, setAhjLoading] = useState(false)
  const [utilityLoading, setUtilityLoading] = useState(false)

  // Individual result states
  const [zillowResult, setZillowResult] = useState<any>(null)
  const [regridResult, setRegridResult] = useState<any>(null)
  const [asce716Result, setAsce716Result] = useState<any>(null)
  const [asce722Result, setAsce722Result] = useState<any>(null)
  const [weatherResult, setWeatherResult] = useState<any>(null)
  const [ahjResult, setAhjResult] = useState<any>(null)
  const [utilityResult, setUtilityResult] = useState<any>(null)
  const [coordinates, setCoordinates] = useState<any>(null)
  const [addressState, setAddressState] = useState<string>("")

  // ASHRAE Station Data State (Store fetched ASHRAE data for stations)
  const [stationAshraeData, setStationAshraeData] = useState<Record<string, AshraeRecord | null>>({})
  const [stationLoading, setStationLoading] = useState<Record<string, boolean>>({})

  const handleScrape = async () => {
    if (!address) {
      toast.error("Please enter an address first")
      return
    }

    setLoading(true)
    
    // Reset individual results
    setZillowResult(null)
    setRegridResult(null)
    setAsce716Result(null)
    setAsce722Result(null)
    setWeatherResult(null)
    setAhjResult(null)
    setUtilityResult(null)
    setCoordinates(null)
    setAddressState("")
    setStationAshraeData({})

    // Set all loaders
    setZillowLoading(true)
    setRegridLoading(true)
    setAsce716Loading(true)
    setAsce722Loading(true)
    setWeatherLoading(true)
    setAhjLoading(true)
    setUtilityLoading(true)

    console.log(`[ScrapersPage] Starting prioritized scrape for: ${address}`)

    // 1. START WEATHER/GEOCODING FIRST (Lightweight API calls)
    geocodeAddress(address).then(geoStep => {
        if (geoStep.success && geoStep.lat && geoStep.lng) {
            setCoordinates({ lat: geoStep.lat, lng: geoStep.lng })
            setAddressState(geoStep.state || "")
            
            fetchNearbyStations(geoStep.lat, geoStep.lng).then(async res => {
                setWeatherResult(res)
                setWeatherLoading(false)
                console.log("[ScrapersPage] Weather Stations done (Prioritized)")
                
                // Automate ASHRAE fetching for each station
                if (res.success && res.data) {
                    console.log("[ScrapersPage] Automating ASHRAE lookups...")
                    for (const station of res.data) {
                        try {
                            // Extract search name (reuse logic from handleStationClick)
                            const searchName = station.name.split(' ')[0].replace(/[^a-zA-Z]/g, '')
                            setStationLoading(prev => ({ ...prev, [station.name]: true }))
                            
                            const query = new URLSearchParams({
                                state: geoStep.state || "",
                                station: searchName,
                                limit: "1"
                            })
                            
                            const response = await fetch(`/api/ashrae/lookup?${query.toString()}`)
                            const ashraeRes = await response.json()
                            
                            if (ashraeRes.status === "success" && ashraeRes.data && ashraeRes.data.length > 0) {
                                setStationAshraeData(prev => ({ ...prev, [station.name]: ashraeRes.data[0] }))
                            } else {
                                setStationAshraeData(prev => ({ ...prev, [station.name]: null }))
                            }
                        } catch (e) {
                            console.error(`Error auto-fetching ASHRAE for ${station.name}:`, e)
                        } finally {
                            setStationLoading(prev => ({ ...prev, [station.name]: false }))
                        }
                    }
                }
            }).catch(e => {
                setWeatherResult({ success: false, error: "Weather fetch failed" })
                setWeatherLoading(false)
            })

            // Trigger AHJ and Utility in parallel with Weather
            scrapeAHJAction(geoStep.lat, geoStep.lng).then(res => {
                setAhjResult(res)
                setAhjLoading(false)
                console.log("[ScrapersPage] AHJ done")
            }).catch(e => {
                setAhjResult({ success: false, error: "AHJ fetch failed" })
                setAhjLoading(false)
            })

            scrapeUtilityAction(geoStep.lat, geoStep.lng).then(res => {
                setUtilityResult(res)
                setUtilityLoading(false)
                console.log("[ScrapersPage] Utility done")
            }).catch(e => {
                setUtilityResult({ success: false, error: "Utility fetch failed" })
                setUtilityLoading(false)
            })
        } else {
            const fail = { success: false, error: "Geocoding failed" }
            setWeatherResult(fail)
            setAhjResult(fail)
            setUtilityResult(fail)
            setWeatherLoading(false)
            setAhjLoading(false)
            setUtilityLoading(false)
            toast.error("Geocoding failed. Check address.")
        }
        
        // --- 2. TRIGGER HEAVY SCRAPERS AFTER GEOCODE STARTS/FINISHES ---
        // We trigger these even if geocode fails (as they use address string)
        
        console.log("[ScrapersPage] Starting heavy scrapers via API Routes...")

        // Zillow fetch
        fetch("/api/scrape/zillow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address })
        }).then(r => r.json())
          .then(res => {
            setZillowResult(res)
            setZillowLoading(false)
            console.log("[ScrapersPage] Zillow done")
        }).catch(e => {
            setZillowResult({ success: false, error: "Zillow API failed" })
            setZillowLoading(false)
        })

        // Regrid fetch
        fetch("/api/scrape/regrid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, email: regridEmail, password: regridPassword })
        }).then(r => r.json())
          .then(res => {
            setRegridResult(res)
            setRegridLoading(false)
            console.log("[ScrapersPage] Regrid done")
        }).catch(e => {
            setRegridResult({ success: false, error: "Regrid API failed" })
            setRegridLoading(false)
        })

        // ASCE 7-16 fetch
        fetch("/api/scrape/asce", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, standard: "7-16" })
        }).then(r => r.json())
          .then(res => {
            setAsce716Result(res)
            setAsce716Loading(false)
            console.log("[ScrapersPage] ASCE 7-16 done")
        }).catch(e => {
            setAsce716Result({ success: false, error: "ASCE 7-16 failed" })
            setAsce716Loading(false)
        })

        // ASCE 7-22 fetch
        fetch("/api/scrape/asce", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, standard: "7-22" })
        }).then(r => r.json())
          .then(res => {
            setAsce722Result(res)
            setAsce722Loading(false)
            console.log("[ScrapersPage] ASCE 7-22 done")
        }).catch(e => {
            setAsce722Result({ success: false, error: "ASCE 7-22 failed" })
            setAsce722Loading(false)
        })

    }).catch(e => {
        console.error("[ScrapersPage] Scrape chain error:", e)
        setWeatherLoading(false)
        setAhjLoading(false)
        setUtilityLoading(false)
    }).finally(() => {
        setLoading(false)
    })
  }


  const handleStationClick = async (stationName: string) => {
    if (!addressState) {
        toast.error("Address state not identified. Cannot fetch ASHRAE data.")
        return
    }

    // Use only the first word for matching (e.g. "HARRISBURG" from "HARRISBURG CAPITAL ARPT")
    const searchName = stationName.split(' ')[0].replace(/[^a-zA-Z]/g, '')
    
    // Toggle/Check if already loading or fetched
    if (stationAshraeData[stationName] !== undefined || stationLoading[stationName]) return

    setStationLoading(prev => ({ ...prev, [stationName]: true }))

    try {
        // Use standard fetch to bypass Server Action queue
        const query = new URLSearchParams({
            state: addressState,
            station: searchName,
            limit: "1"
        })
        
        const response = await fetch(`/api/ashrae/lookup?${query.toString()}`)
        const res = await response.json()

        if (res.status === "success" && res.data && res.data.length > 0) {
            setStationAshraeData(prev => ({ ...prev, [stationName]: res.data[0] }))
        } else {
            setStationAshraeData(prev => ({ ...prev, [stationName]: null }))
        }
    } catch (e) {
        console.error("Error fetching ASHRAE data:", e)
    } finally {
        setStationLoading(prev => ({ ...prev, [stationName]: false }))
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Property Scrapers</h1>
          <p className="text-muted-foreground">
            Retrieve data from Zillow, ASCE Hazard Tool (7-16 & 7-22), and Regrid for any address.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-primary/10 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg">Enter Address</CardTitle>
                    <CardDescription>Use Google Address Autocomplete to find the property</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <AddressAutocomplete 
                            value={address} 
                            onChange={(val) => {
                                console.log(`[ScrapersPage] Address changed: ${val}`)
                                setAddress(val)
                            }} 
                        />
                    </div>
                    <Button 
                        onClick={handleScrape} 
                        disabled={loading || !address} 
                        className="sm:w-40"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Start Scapers
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-orange-500" />
                        <CardTitle className="text-sm font-medium">Regrid Credentials</CardTitle>
                    </div>
                    <CardDescription className="text-[11px]">Required for Regrid scraping</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="regrid-email" className="text-[10px] uppercase font-bold text-muted-foreground">Email</Label>
                        <Input 
                            id="regrid-email" 
                            type="email" 
                            placeholder="email@example.com" 
                            value={regridEmail} 
                            onChange={(e) => setRegridEmail(e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="regrid-password" className="text-[10px] uppercase font-bold text-muted-foreground">Password</Label>
                        <Input 
                            id="regrid-password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={regridPassword} 
                            onChange={(e) => setRegridPassword(e.target.value)}
                            className="h-8 text-xs"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        {(loading || zillowLoading || regridLoading || asce716Loading || asce722Loading || weatherLoading || ahjLoading || utilityLoading) && (
            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-border animate-pulse">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Scrapers are running in parallel. Results will appear as they arrive.
                </p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Weather Station Results - SHOWN FIRST */}
            <Card className={(weatherResult?.success || weatherLoading) ? "md:col-span-2" : "md:col-span-2 border-destructive/20 opacity-80"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-orange-400" />
                  <CardTitle className="text-md font-medium">NWS Weather Stations</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    {coordinates && (
                        <Badge variant="secondary" className="font-mono text-[10px]">
                            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </Badge>
                    )}
                    {weatherLoading ? (
                        <Badge variant="outline" className="animate-pulse">Loading...</Badge>
                    ) : (
                        weatherResult && (
                            <Badge variant={weatherResult.success ? "outline" : "destructive"}>
                                {weatherResult.success ? "Success" : "Failed"}
                            </Badge>
                        )
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                    </div>
                ) : weatherResult?.success ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {weatherResult.data?.map((station: any, i: number) => {
                      const ashrae = stationAshraeData[station.name]
                      const isStnLoading = stationLoading[station.name]
                      
                      return (
                        <div 
                          key={i} 
                          className="p-3 rounded-lg border border-border bg-card/50 flex flex-col gap-2 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all active:scale-[0.98] relative group"
                          onClick={() => handleStationClick(station.name)}
                        >
                          <div className="flex justify-between items-start">
                              <span className="font-bold text-sm truncate max-w-[150px]">{station.name}</span>
                              <div className="flex items-center gap-1">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <CopyButton 
                                        title={station.name}
                                        fields={[
                                            { label: "Station ID", value: station.id },
                                            { label: "Distance", value: `${(station.distance / 1000).toFixed(2)} km` },
                                            ...(ashrae ? [
                                                { label: "ASHRAE High 2%", value: `${ashrae.high_temp_2_avg}°C` },
                                                { label: "ASHRAE Extr Min", value: `${ashrae.extreme_temp_min}°C` }
                                            ] : [])
                                        ]}
                                    />
                                </div>
                                <Badge variant="outline" className="text-[10px] h-4 px-1">{station.id}</Badge>
                              </div>
                          </div>
                          
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Distance: {(station.distance / 1000).toFixed(2)} km</span>
                              {ashrae === undefined && !isStnLoading && <span className="text-primary hover:underline italic">Click for ASHRAE</span>}
                          </div>

                          {isStnLoading && <Loader2 className="h-3 w-3 animate-spin mx-auto text-primary/40" />}
                          
                          {ashrae && (
                            <div className="mt-1 pt-2 border-t border-border/50 grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase font-bold text-muted-foreground">High 2%</span>
                                    <span className="text-xs font-bold text-blue-600">{ashrae.high_temp_2_avg}°C</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase font-bold text-muted-foreground">Extr Min</span>
                                    <span className="text-xs font-bold text-orange-600">{ashrae.extreme_temp_min}°C</span>
                                </div>
                            </div>
                          )}
                          
                          {ashrae === null && (
                            <div className="text-[9px] text-destructive italic text-center border-t border-border/20 pt-1">No ASHRAE data found</div>
                          )}
                        </div>
                      )
                    })}
                    {(!weatherResult.data || weatherResult.data.length === 0) && (
                        <div className="col-span-full py-4 text-center text-muted-foreground text-sm">
                            No nearby weather stations found.
                        </div>
                    )}
                  </div>
                ) : weatherResult ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-destructive font-medium">{weatherResult.error || "Unknown Error"}</p>
                  </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground text-sm italic">
                        Start scraping to see nearby weather stations
                    </div>
                )}
              </CardContent>
            </Card>

            {/* AHJ Results */}
            <ResultCard 
              title="AHJ Information" 
              icon={<Map className="h-5 w-5 text-indigo-500" />} 
              data={ahjResult}
              loading={ahjLoading}
              fields={[
                { label: "Jurisdiction", value: ahjResult?.data?.jurisdiction || "N/A" },
                { label: "Place", value: ahjResult?.data?.place || "N/A" },
                { label: "Subdivision", value: ahjResult?.data?.countySubdivision || "N/A" },
                { label: "County", value: ahjResult?.data?.county || "N/A" }
              ]}
            />

            {/* Utility Results */}
            <ResultCard 
              title="Utility Provider" 
              icon={<Plug className="h-5 w-5 text-yellow-500" />} 
              data={utilityResult}
              loading={utilityLoading}
              fields={[
                { label: "Utility Name", value: utilityResult?.data?.utilityName || "N/A" },
                { label: "Res. Rate", value: utilityResult?.data?.residentialRate ? `$${utilityResult.data.residentialRate}/kWh` : "N/A" },
                { label: "Comm. Rate", value: utilityResult?.data?.commercialRate ? `$${utilityResult.data.commercialRate}/kWh` : "N/A" },
                { label: "Company ID", value: utilityResult?.data?.companyId || "N/A" }
              ]}
            />

            {/* ASCE 7-22 Results */}
            <ResultCard 
              title="ASCE 7-22 Hazards" 
              icon={<Wind className="h-5 w-5 text-emerald-500" />} 
              data={asce722Result}
              loading={asce722Loading}
              fields={[
                { label: "Wind Speed", value: asce722Result?.data?.windSpeed || "N/A" },
                { label: "Ground Snow Load", value: asce722Result?.data?.snowLoad || "N/A" }
              ]}
            />

            {/* ASCE 7-16 Results */}
            <ResultCard 
              title="ASCE 7-16 Hazards" 
              icon={<Snowflake className="h-5 w-5 text-cyan-500" />} 
              data={asce716Result}
              loading={asce716Loading}
              fields={[
                { label: "Wind Speed", value: asce716Result?.data?.windSpeed || "N/A" },
                { label: "Ground Snow Load", value: asce716Result?.data?.snowLoad || "N/A" }
              ]}
            />

            {/* Zillow Results */}
            <ResultCard 
              title="Zillow Data" 
              icon={<Home className="h-5 w-5 text-blue-500" />} 
              data={zillowResult}
              loading={zillowLoading}
              fields={[
                { label: "Parcel ID", value: zillowResult?.data?.parcel_number || "N/A" },
                { label: "Lot Size", value: zillowResult?.data?.lot_size || "N/A" },
                { label: "Year Built", value: zillowResult?.data?.year_built || "N/A" },
                { label: "Interior Area", value: zillowResult?.data?.interior_area || "N/A" },
                { label: "New Construction", value: zillowResult?.data?.new_construction ? "Yes" : "No" }
              ]}
            />

            {/* Regrid Results */}
            <ResultCard 
              title="Regrid Data" 
              icon={<Database className="h-5 w-5 text-orange-500" />} 
              data={regridResult}
              loading={regridLoading}
              fields={[
                { label: "Parcel ID", value: regridResult?.data?.parcel_number || "N/A" },
                { label: "Owner", value: regridResult?.data?.owner || "N/A" },
                { label: "Lot Size", value: regridResult?.data?.lot_size || "N/A" },
                { label: "Land Use", value: regridResult?.data?.land_use || "N/A" }
              ]}
            />
        </div>
      </div>

    </div>
  )
}

function ResultCard({ title, icon, data, fields, loading }: { title: string, icon: React.ReactNode, data: any, fields: { label: string, value: any }[], loading?: boolean }) {
  const success = data?.success
  
  return (
    <Card className={(!success && data) ? "border-destructive/20 opacity-80" : "relative group"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            {!loading && data && (
                <CopyButton 
                    title={title} 
                    fields={fields} 
                />
            )}
            {loading ? (
                <Badge variant="outline" className="animate-pulse">Loading...</Badge>
            ) : data && (
                <Badge variant={success ? "outline" : "destructive"}>
                    {success ? "Success" : "Failed"}
                </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                <span className="text-[10px] text-muted-foreground">Scraping...</span>
            </div>
        ) : success ? (
          <div className="space-y-3 mt-4">
            {fields.map((field, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{field.label}</span>
                <span className="font-semibold">{field.value}</span>
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="py-4 text-center">
            <p className="text-sm text-destructive font-medium">{data?.error || "Unknown Error"}</p>
          </div>
        ) : (
            <div className="py-8 text-center text-muted-foreground text-sm italic">
                Data will appear here
            </div>
        )}
      </CardContent>
    </Card>
  )
}

function CopyButton({ title, fields }: { title: string, fields: { label: string, value: any }[] }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        const text = `${title}\n` + fields.map(f => `${f.label}: ${f.value}`).join('\n')
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(`${title} copied to clipboard`)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-zinc-100 transition-colors" 
            onClick={handleCopy}
            title="Copy to clipboard"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
            )}
        </Button>
    )
}
