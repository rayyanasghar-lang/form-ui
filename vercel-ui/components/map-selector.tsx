"use client"

import React, { useCallback, useEffect, useState } from "react"
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"

interface MapSelectorProps {
  lat: number | null
  lng: number | null
  onLocationChange: (lat: number, lng: number) => void
  className?: string
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
}

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
}

const libraries: "places"[] = ["places"]

export default function MapSelector({ lat, lng, onLocationChange, className }: MapSelectorProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState(defaultCenter)

  useEffect(() => {
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      setCenter({ lat, lng })
    }
  }, [lat, lng])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onLocationChange(e.latLng.lat(), e.latLng.lng())
    }
  }, [onLocationChange])

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onLocationChange(e.latLng.lat(), e.latLng.lng())
    }
  }, [onLocationChange])

  if (!isLoaded) {
    return <div className="w-full h-[300px] rounded-xl bg-muted animate-pulse" />
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border w-full h-full min-h-[250px] ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy", // Better for mobile
        }}
      >
        {lat && lng && (
          <MarkerF
            position={{ lat, lng }}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>
    </div>
  )
}
