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
    // Address selection is now just a value update
    onChange(address)
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
