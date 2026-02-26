"use client"

import React, { useEffect, useState } from "react"
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"

interface ProjectInfoPanelProps {
    contractorInfo: {
        companyName: string
        companyLogo?: string
        contactName: string
        email: string
        phone: string
        address?: string
        licenseNo?: string
        hicNo?: string
    }
    projectInfo: {
        customerName: string
        address: string
        systemSize: string
        acSystemSize?: string
        systemType: string
        parcelNumber: string
        utilityNo?: string
        projectType: string
    }
    coordinates: {
        lat: number | null
        lng: number | null
    }
}

const libraries: "places"[] = ["places"]
const defaultCenter = { lat: 40.3573, lng: -75.1249 }
const mapFill = { width: "100%", height: "100%" }

export default function ProjectInfoPanel({
    contractorInfo,
    projectInfo,
    coordinates,
}: ProjectInfoPanelProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    })

    const [contractorImage, setContractorImage] = useState<string | null>(null)
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("contractor")
                if (stored) {
                    const c = JSON.parse(stored)
                    const img = c.image_url || c.logo || c.image_1920 || c.image_128 || c.avatar || c.company_logo || null
                    if (img) setContractorImage(img)
                }
            } catch (e) { /* ignore */ }
        }
    }, [])

    const center =
        coordinates.lat && coordinates.lng
            ? { lat: coordinates.lat, lng: coordinates.lng }
            : defaultCenter
    const hasCoordinates = coordinates.lat !== null && coordinates.lng !== null

    return (
        <div
            style={{
                fontFamily: '"Times New Roman", serif',
                border: "2px solid black",
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                background: "white",
                height: "100%",
            }}
        >
            {/* ══════ LEFT COLUMN ══════ */}
            <div style={{ borderRight: "2px solid black", display: "flex", flexDirection: "column" }}>

                {/* Satellite View Section */}
                <div style={{ borderBottom: "2px solid black", padding: "5px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h2 style={{ margin: "5px 0", fontSize: "18px", borderBottom: "1px solid black", textTransform: "uppercase" }}>
                        Satellite View
                    </h2>
                    <div style={{ flex: 1, minHeight: "250px", border: "1px solid black", position: "relative" }}>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapFill}
                                center={center}
                                zoom={hasCoordinates ? 18 : 4}
                                options={{
                                    mapTypeId: "satellite",
                                    disableDefaultUI: true,
                                    zoomControl: false,
                                    gestureHandling: "cooperative",
                                }}
                            >
                                {hasCoordinates && <MarkerF position={center} />}
                            </GoogleMap>
                        ) : (
                            <div style={{ width: "100%", height: "100%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "gray" }}>
                                Loading Satellite...
                            </div>
                        )}
                    </div>
                </div>

                {/* Vicinity Map Section */}
                <div style={{ padding: "5px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h2 style={{ margin: "5px 0", fontSize: "18px", borderBottom: "1px solid black", textTransform: "uppercase" }}>
                        Vicinity Map
                    </h2>
                    <div style={{ flex: 1, minHeight: "200px", border: "1px solid black", position: "relative" }}>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapFill}
                                center={center}
                                zoom={hasCoordinates ? 14 : 4}
                                options={{
                                    mapTypeId: "roadmap",
                                    disableDefaultUI: true,
                                    zoomControl: false,
                                    gestureHandling: "cooperative",
                                }}
                            >
                                {hasCoordinates && <MarkerF position={center} />}
                            </GoogleMap>
                        ) : (
                            <div style={{ width: "100%", height: "100%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "gray" }}>
                                Loading Map...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════ RIGHT COLUMN ══════ */}
            <div style={{ textAlign: "center", color: "#000", display: "flex", flexDirection: "column" }}>

                {/* Logo Section */}
                <div style={{
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "2px solid black",
                    padding: "10px"
                }}>
                    <img
                        src={contractorInfo.companyLogo || contractorImage || "/images/contractor_logo_1771863583908.png"}
                        alt={contractorInfo.companyName || "Contractor"}
                        style={{ maxHeight: "120px", maxWidth: "95%", objectFit: "contain" }}
                    />
                </div>

                {/* CONTRACTOR SECTION */}
                <h3 style={{ margin: 0, padding: "8px 0", fontSize: "16px", textTransform: "uppercase", borderBottom: "2px solid black", fontWeight: 700 }}>Contractor</h3>
                <div style={{ fontSize: "11px", textTransform: "uppercase" }}>
                    <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                        {contractorInfo.companyName || "—"}
                    </div>
                    {contractorInfo.phone && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            {contractorInfo.phone}
                        </div>
                    )}
                    {contractorInfo.address && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black", fontWeight: 700 }}>
                            {contractorInfo.address}
                        </div>
                    )}
                    {contractorInfo.email && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            {contractorInfo.email}
                        </div>
                    )}
                    <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                        License No.
                    </div>
                    {contractorInfo.hicNo && (
                        <div style={{ padding: "6px 8px", borderBottom: "2px solid black" }}>
                            HIC No: {contractorInfo.hicNo}
                        </div>
                    )}
                </div>

                {/* PROJECT INFO SECTION */}
                <h3 style={{ margin: 0, padding: "8px 0", fontSize: "16px", textTransform: "uppercase", borderBottom: "2px solid black", fontWeight: 700 }}>Project Info</h3>
                <div style={{ fontSize: "11px", textTransform: "uppercase", flex: 1 }}>
                    {projectInfo.customerName && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            {projectInfo.customerName}
                        </div>
                    )}
                    {contractorInfo.contactName && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            {contractorInfo.contactName}
                        </div>
                    )}
                    {projectInfo.address && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black", fontWeight: 700 }}>
                            {projectInfo.address}
                        </div>
                    )}
                    {projectInfo.systemSize && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            <b>DC System Size:</b><br />{projectInfo.systemSize}
                        </div>
                    )}
                    {projectInfo.acSystemSize && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            <b>AC System Size:</b><br />{projectInfo.acSystemSize}
                        </div>
                    )}
                    {projectInfo.parcelNumber && (
                        <div style={{ padding: "6px 8px", borderBottom: "1px solid black" }}>
                            <b>Parcel No:</b><br />{projectInfo.parcelNumber}
                        </div>
                    )}
                    {projectInfo.utilityNo && (
                        <div style={{ padding: "6px 8px" }}>
                            <b>Utility No:</b><br />{projectInfo.utilityNo}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
