"use client"

import * as React from "react"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import axios from "axios"
import { useJsApiLoader } from "@react-google-maps/api"
import { Loader2, MapPin } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

const libraries: "places"[] = ["places"]

export default function AddressAutocomplete({ value, onChange, disabled, className }: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  // We only want to initialize usePlacesAutocomplete if script is loaded
  if (!isLoaded) return <Input disabled placeholder="Loading maps..." className={className} />
  if (loadError) return <Input disabled placeholder="Error loading maps" className={className} />

  return <PlacesAutocomplete value={value} onChange={onChange} disabled={disabled} className={className} />
}

function PlacesAutocomplete({ value, onChange, disabled, className }: AddressAutocompleteProps) {
  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed */
    },
    debounce: 300,
    defaultValue: value,
  })

  const [isScraping, setIsScraping] = React.useState(false)

  // Sync external value with internal state if it changes externally
  React.useEffect(() => {
    if (value !== searchValue) {
      setValue(value, false)
    }
  }, [value, setValue, searchValue])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange(e.target.value)
  }

  const handleSelect = async (address: string) => {
    setValue(address, false)
    clearSuggestions()
    onChange(address)
    setIsScraping(true)

    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])
      console.log("📍 Coordinates:", { lat, lng })
      
      try {
        console.log("☀️ Fetching solar data for:", address);
        const { data: solarData } = await axios.get('/api/solar', { params: { address } });
        console.log("☀️ Solar Analysis:", solarData);
        
        // Save to shared store for use in solar-layers page
        const { saveSolarData } = await import("@/lib/solar-store");
        saveSolarData({
          address: solarData.address || address,
          lat: solarData.lat,
          lng: solarData.lng,
          solar: solarData.solar,
          layers: solarData.layers,
        });
        console.log("💾 Solar data saved to store");
      } catch (err: any) {
        console.error("❌ Solar Analysis Error:", err);
      }

      // 🔍 Scrape Zillow and ASCE Data
      try {
        console.log("🔍 Starting property scraping for:", address);
        // Dispatch event to notify listeners that scraping has started
        window.dispatchEvent(new CustomEvent("property-data-scraping-started"));
        
        const { scrapeZillowAction, scrapeASCE716Action, scrapeASCE722Action, scrapeRegridAction } = await import("@/app/actions/scrape-service");
        const { savePropertyData, updatePropertyData } = await import("@/lib/property-store");

        // Initial empty save to establish the address and timestamp
        savePropertyData({
            address,
            lotSize: null,
            parcelNumber: null,
            owner: null,
            landUse: null,
            windSpeed: null,
            snowLoad: null,
            sources: {}
        });

        // Run all scrapers in parallel, but update independently
        Promise.allSettled([
            scrapeZillowAction(address).then(res => {
                if (res.success && res.data) {
                    updatePropertyData({
                        lotSize: res.data.lot_size,
                        parcelNumber: res.data.parcel_number,
                        interiorArea: res.data.interior_area,
                        structureArea: res.data.structure_area,
                        newConstruction: res.data.new_construction,
                        yearBuilt: res.data.year_built,
                        sources: {
                            zillow: {
                                parcelNumber: res.data.parcel_number || null,
                                lotSize: res.data.lot_size || null,
                                interiorArea: res.data.interior_area || null,
                                structureArea: res.data.structure_area || null,
                                newConstruction: res.data.new_construction ?? null,
                                yearBuilt: res.data.year_built || null,
                            }
                        }
                    });
                }
            }),
            scrapeASCE716Action(address).then(res => {
                if (res.success && res.data) {
                    updatePropertyData({
                        windSpeed716: res.data.windSpeed || null,
                        snowLoad716: res.data.snowLoad || null,
                        sources: {
                            asce716: {
                                windSpeed: res.data.windSpeed || null,
                                snowLoad: res.data.snowLoad || null
                            }
                        }
                    });
                }
            }),
            scrapeASCE722Action(address).then(res => {
                if (res.success && res.data) {
                    updatePropertyData({
                        windSpeed: res.data.windSpeed || null,
                        snowLoad: res.data.snowLoad || null,
                        sources: {
                            asce: {
                                windSpeed: res.data.windSpeed || null,
                                snowLoad: res.data.snowLoad || null
                            }
                        }
                    });
                }
            }),
            scrapeRegridAction(address).then(res => {
                if (res.success && res.data) {
                    updatePropertyData({
                        lotSize: res.data.lot_size,
                        parcelNumber: res.data.parcel_number,
                        owner: res.data.owner,
                        landUse: res.data.land_use,
                        sources: {
                            regrid: {
                                parcelNumber: res.data.parcel_number || null,
                                owner: res.data.owner || null,
                                lotSize: res.data.lot_size || null,
                                landUse: res.data.land_use || null
                            }
                        }
                    });
                }
            })
        ]).finally(() => {
            setIsScraping(false);
            window.dispatchEvent(new CustomEvent("property-data-scraping-completed"));
        });

        return; // Don't block on the scrapers completing
        console.log("💾 Property data saved to store");
      } catch (err: any) {
        console.error("❌ Scraping Error:", err);
      } finally {
        setIsScraping(false)
      }

      // You could pass these back up if needed
    } catch (error) {
      console.error("Error: ", error)
      setIsScraping(false)
    }
  }

  return (
    <div className="relative w-full">
      <Input
        value={searchValue}
        onChange={handleInput}
        disabled={!ready || disabled}
        placeholder="Start typing address..."
        className={cn("pr-10", className)}
        autoComplete="off" // Disable browser autocomplete
      />
      <div className="absolute right-3 top-2.5 flex items-center gap-2">
        {isScraping && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        <MapPin className="h-5 w-5 text-muted-foreground pointer-events-none opacity-50" />
      </div>

      {status === "OK" && (
        <ul className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 shrink-0 opacity-50" />
              <span>{description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
