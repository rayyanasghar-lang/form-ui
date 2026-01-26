"use client"

import React, { useState } from "react"
import { Search, Loader2, Info, Building, Home, Wind, Snowflake, MapPin, Database, CloudSun } from "lucide-react"
import AddressAutocomplete from "@/components/address-autocomplete"
import { 
  scrapeZillowAction, 
  scrapeRegridAction, 
  scrapeASCE716Action, 
  scrapeASCE722Action 
} from "@/app/actions/scrape-service"
import { geocodeAddress, fetchNearbyStations } from "@/app/actions/weather-service"
import { fetchAshraeData, AshraeRecord } from "@/app/actions/ashrae-service"
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

  // Individual result states
  const [zillowResult, setZillowResult] = useState<any>(null)
  const [regridResult, setRegridResult] = useState<any>(null)
  const [asce716Result, setAsce716Result] = useState<any>(null)
  const [asce722Result, setAsce722Result] = useState<any>(null)
  const [weatherResult, setWeatherResult] = useState<any>(null)
  const [coordinates, setCoordinates] = useState<any>(null)
  const [addressState, setAddressState] = useState<string>("")

  // ASHRAE Modal State
  const [isAshraeModalOpen, setIsAshraeModalOpen] = useState(false)
  const [selectedStation, setSelectedStation] = useState<string>("")
  const [ashraeData, setAshraeData] = useState<AshraeRecord | null>(null)
  const [ashraeLoading, setAshraeLoading] = useState(false)

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
    setCoordinates(null)
    setAddressState("")
    setAshraeData(null)

    // Set all loaders
    setZillowLoading(true)
    setRegridLoading(true)
    setAsce716Loading(true)
    setAsce722Loading(true)
    setWeatherLoading(true)

    setWeatherLoading(true)

    console.log(`[ScrapersPage] Starting prioritized scrape for: ${address}`)

    // 1. START WEATHER/GEOCODING FIRST (Lightweight API calls)
    geocodeAddress(address).then(geoStep => {
        if (geoStep.success && geoStep.lat && geoStep.lng) {
            setCoordinates({ lat: geoStep.lat, lng: geoStep.lng })
            setAddressState(geoStep.state || "")
            
            fetchNearbyStations(geoStep.lat, geoStep.lng).then(res => {
                setWeatherResult(res)
                setWeatherLoading(false)
                console.log("[ScrapersPage] Weather Stations done (Prioritized)")
            })
        } else {
            const fail = { success: false, error: "Geocoding failed" }
            setWeatherResult(fail)
            setWeatherLoading(false)
            toast.error("Geocoding failed. Check address.")
        }
        
        // --- 2. TRIGGER HEAVY SCRAPERS AFTER GEOCODE STARTS/FINISHES ---
        // We trigger these even if geocode fails (as they use address string)
        
        console.log("[ScrapersPage] Starting heavy scrapers...")

        scrapeZillowAction(address).then(res => {
            setZillowResult(res)
            setZillowLoading(false)
            console.log("[ScrapersPage] Zillow done")
        })

        scrapeRegridAction(address, regridEmail, regridPassword).then(res => {
            setRegridResult(res)
            setRegridLoading(false)
            console.log("[ScrapersPage] Regrid done")
        })

        scrapeASCE716Action(address).then(res => {
            setAsce716Result(res)
            setAsce716Loading(false)
            console.log("[ScrapersPage] ASCE 7-16 done")
        })

        scrapeASCE722Action(address).then(res => {
            setAsce722Result(res)
            setAsce722Loading(false)
            console.log("[ScrapersPage] ASCE 7-22 done")
        })

    }).catch(e => {
        console.error("[ScrapersPage] Scrape chain error:", e)
        setWeatherLoading(false)
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
    console.log(`[ASHRAE Client] Fetching: ${searchName} in ${addressState} (Full name: ${stationName})`)

    setSelectedStation(stationName)
    setIsAshraeModalOpen(true)
    setAshraeLoading(true)
    setAshraeData(null)

    try {
        // Use standard fetch to bypass Server Action queue
        const query = new URLSearchParams({
            state: addressState,
            station: searchName,
            limit: "1"
        })
        
        const response = await fetch(`/api/ashrae/lookup?${query.toString()}`)
        const res = await response.json()

        console.log(`[ASHRAE Client] API Response for ${searchName}:`, res)

        if (res.status === "success" && res.data && res.data.length > 0) {
            setAshraeData(res.data[0])
        } else {
            console.warn(`[ASHRAE Client] No data found for ${searchName}`)
            // Keep ashraeData null to show "No data found"
        }
    } catch (e) {
        console.error("Error fetching ASHRAE data:", e)
        toast.error("Failed to fetch ASHRAE data")
    } finally {
        setAshraeLoading(false)
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

        {(loading || zillowLoading || regridLoading || asce716Loading || asce722Loading || weatherLoading) && (
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
                <div className="flex gap-2">
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
                    {weatherResult.data?.map((station: any, i: number) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg border border-border bg-card/50 flex flex-col gap-1 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all active:scale-[0.98]"
                        onClick={() => handleStationClick(station.name)}
                      >
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-sm truncate max-w-[150px]">{station.name}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">{station.id}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Distance:</span>
                            <span>{(station.distance / 1000).toFixed(2)} km</span>
                        </div>
                      </div>
                    ))}
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
        </div>
      </div>

      <Dialog open={isAshraeModalOpen} onOpenChange={setIsAshraeModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-orange-400" />
              ASHRAE Weather Data
            </DialogTitle>
            <DialogDescription>
              Details for station: <span className="font-semibold text-zinc-900">{selectedStation}</span>
            </DialogDescription>
          </DialogHeader>

          {ashraeLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Fetching ASHRAE records...</p>
            </div>
          ) : ashraeData ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">State</span>
                  <span className="text-lg font-bold text-zinc-900">{ashraeData.state}</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Station ID</span>
                  <span className="text-sm font-bold text-zinc-900 truncate" title={ashraeData.station}>{ashraeData.station}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <CloudSun className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">High Temp 2% Avg</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">{ashraeData.high_temp_2_avg}°C</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <Snowflake className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">Extreme Min Temp</span>
                  </div>
                  <span className="text-lg font-bold text-orange-700">{ashraeData.extreme_temp_min}°C</span>
                </div>
              </div>
              
              <p className="text-[10px] text-center text-muted-foreground italic">
                Data source: ASHRAE Fundamentals Handbook
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">No ASHRAE data found</p>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  We couldn't find a matching record for {selectedStation} in {addressState}.
                </p>
              </div>
              <Button variant="outline" className="mt-2 rounded-xl" onClick={() => setIsAshraeModalOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResultCard({ title, icon, data, fields, loading }: { title: string, icon: React.ReactNode, data: any, fields: { label: string, value: any }[], loading?: boolean }) {
  const success = data?.success
  
  return (
    <Card className={(!success && data) ? "border-destructive/20 opacity-80" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-md font-medium">{title}</CardTitle>
        </div>
        {loading ? (
            <Badge variant="outline" className="animate-pulse">Loading...</Badge>
        ) : data && (
            <Badge variant={success ? "outline" : "destructive"}>
                {success ? "Success" : "Failed"}
            </Badge>
        )}
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
