"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

interface SolarDocumentProps {
  contractorInfo: {
    companyName: string;
    companyLogo?: string;
    contactName: string;
    email: string;
    phone: string;
    address?: string;
    licenseNo?: string;
    hicNo?: string;
  };
  projectInfo: {
    customerName: string;
    address: string;
    systemSize: string;
    acSystemSize?: string;
    systemType: string;
    parcelNumber: string;
    utilityNo?: string;
    projectType: string;
  };
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
}

const libraries: "places"[] = ["places"];
const defaultCenter = { lat: 40.3573, lng: -75.1249 };
const mapFill = { width: "100%", height: "100%" };

export default function SolarDocument({
  contractorInfo,
  projectInfo,
  coordinates,
}: SolarDocumentProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const center =
    coordinates.lat && coordinates.lng
      ? { lat: coordinates.lat, lng: coordinates.lng }
      : defaultCenter;
  const hasCoordinates = coordinates.lat !== null && coordinates.lng !== null;

  return (
    <div
      className="w-[850px] bg-white overflow-hidden shadow-2xl border-4 border-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* HEADER */}
      <div className="flex h-12 border-b-4 border-black">
        <div className="flex-1 p-1 flex items-center justify-center">
          <h1 className="text-[11px] font-bold tracking-wide text-center uppercase">
            {projectInfo.customerName || "KEVIN MEYERS"}'S{" "}
            {projectInfo.systemSize || "18.45"}-KWp SOLAR SYSTEM INSTALLATION
          </h1>
        </div>
      </div>

      {/* MAIN THREE-COLUMN LAYOUT */}
      <div className="flex border-black min-h-[600px]">
        {/* LEFT COLUMN - PROJECT DATA */}
        <div className="w-60 border-r-4 border-black">
          <div className="border-b-2 border-black p-1 bg-gray-100 text-center font-bold text-[9px] sticky top-0 z-10">
            PROJECT DATA
          </div>

          <table className="w-full text-[8px] border-collapse uppercase">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50 w-1/2">
                  PROJECT ADDRESS
                </td>
                <td className="p-0.5 leading-tight">
                  {projectInfo.address || "292 DUNN RD, HONESDALE, PA 18731"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  OWNER
                </td>
                <td className="p-0.5">
                  {projectInfo.customerName || "KEVIN MEYERS"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  SYSTEM INTERCONNECTION
                </td>
                <td className="p-0.5 leading-tight">
                  LINESIDE CONNECTION (INSIDE MSP)
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  FUSED DISCONNECT
                </td>
                <td className="p-0.5">-</td>
              </tr>
              <tr className="border-b border-black">
                <td
                  rowSpan={3}
                  className="border-r border-black p-0.5 font-bold bg-gray-50"
                >
                  MAIN SERVICE PANEL
                </td>
                <td className="border-b border-black p-0.5">
                  MSP BUSBAR RATING<span className="float-right">200A</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-0.5">
                  MSP BREAKER RATING<span className="float-right">200A</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-0.5">
                  EXPOSURE CATEGORY<span className="float-right">C</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  SNOW LOAD
                </td>
                <td className="p-0.5">40 PSF</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  WIND SPEED
                </td>
                <td className="p-0.5">115 MPH</td>
              </tr>
              <tr className="border-b border-black">
                <td
                  rowSpan={4}
                  className="border-r border-black p-0.5 font-bold bg-gray-50"
                >
                  BUILDING INFORMATION
                </td>
                <td className="border-b border-black p-0.5">
                  PROPERTY TYPE
                  <span className="float-right">
                    {projectInfo.projectType || "RESIDENTIAL"}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-0.5">
                  ROOF TYPE<span className="float-right">ASPHALT SHINGLE</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-0.5">
                  LOT AREA<span className="float-right">9 ACRES</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-0.5">
                  UTILITY METER<span className="float-right">PPL</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  RACKING INFO
                </td>
                <td className="p-0.5">IRONRIDGE XR-100</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  ANCHOR
                </td>
                <td className="p-0.5">IRONRIDGE HUG</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  JURISDICTION
                </td>
                <td className="p-0.5">BERLIN TOWNSHIP</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 font-bold bg-gray-50">
                  AREA OF ROOF
                </td>
                <td className="p-0.5">3781.21 SQ FT</td>
              </tr>
            </tbody>
          </table>

          <div className="border-y-2 border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
            CODE REFERENCE
          </div>
          <ul className="text-[7px] p-1 uppercase list-none space-y-0.5">
            <li>ASCE 7-16</li>
            <li>NEC 2017</li>
            <li>IRC 2018</li>
            <li>IBC 2018</li>
          </ul>
        </div>

        {/* CENTER COLUMN - NOTES & EQUIPMENT */}
        <div className="flex-1 border-r-4 border-black">
          <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[9px]">
            GENERAL NOTES
          </div>
          <ol className="text-[7px] p-1 space-y-0.5 list-decimal list-inside uppercase">
            <li>PV MODULES PROTECTED FROM DAMAGE.</li>
            <li>METALLIC COMPONENTS GROUNDED.</li>
            <li>EQUIPMENT MEETS NEC SETBACKS.</li>
            <li>OCDS RATINGS PER NEC.</li>
            <li>RAPID SHUTDOWN FUNCTION INCLUDED.</li>
          </ol>

          <div className="border-y-2 border-black p-1 bg-gray-100 text-center font-bold text-[9px]">
            SCOPE OF WORK
          </div>
          <div className="p-1.5 text-[8px] text-center font-bold border-b border-black uppercase">
            {projectInfo.systemType || "ROOF MOUNT"}{" "}
            {projectInfo.systemSize || "18.45"}-KWp SOLAR SYSTEM
          </div>

          <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[9px]">
            NEW EQUIPMENT
          </div>
          <table className="w-full text-[7px] border-collapse uppercase">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-0.5 text-left">ITEM</th>
                <th className="border-r border-black p-0.5 text-left">MODEL</th>
                <th className="p-0.5 text-left">SPEC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5">MODULE</td>
                <td className="border-r border-black p-0.5">MAXEON 3</td>
                <td className="p-0.5">410W</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5">INVERTER</td>
                <td className="border-r border-black p-0.5">IQ8A-72</td>
                <td className="p-0.5">1.45A</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5">DC SIZE</td>
                <td className="border-r border-black p-0.5">-</td>
                <td className="p-0.5">{projectInfo.systemSize} KWp</td>
              </tr>
            </tbody>
          </table>

          <div className="border-y-2 border-black p-1 bg-gray-100 text-center font-bold text-[9px]">
            EXISTING EQUIPMENT
          </div>
          <table className="w-full text-[7px] border-collapse uppercase">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5 w-1/2">PANEL</td>
                <td className="p-0.5">200A BUS</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-0.5">METER</td>
                <td className="p-0.5">PPL</td>
              </tr>
            </tbody>
          </table>

          <div className="border-y-2 border-black p-1 bg-gray-100 text-center font-bold text-[9px]">
            RELATED NOTE
          </div>
          <p className="text-[7px] p-1 text-center uppercase leading-tight">
            ACCORDING TO NEC CODE 2017, 18-INCH SETBACK WILL BE PROVIDED.
          </p>
        </div>

        {/* RIGHT COLUMN - SUBDIVIDED */}
        <div className="flex-1 flex">
          {/* SUB-COLUMN 1 - MAPS & INDEX */}
          <div className="w-40 border-r-2 border-black">
            <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
              SATELLITE VIEW
            </div>
            <div className="h-24 relative border-b-2 border-black">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapFill}
                  center={center}
                  zoom={18}
                  options={{ mapTypeId: "satellite", disableDefaultUI: true }}
                >
                  {hasCoordinates && <MarkerF position={center} />}
                </GoogleMap>
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
            </div>

            <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
              VICINITY MAP
            </div>
            <div className="h-24 relative border-b-2 border-black">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapFill}
                  center={center}
                  zoom={14}
                  options={{ mapTypeId: "roadmap", disableDefaultUI: true }}
                >
                  {hasCoordinates && <MarkerF position={center} />}
                </GoogleMap>
              ) : (
                <div className="w-full h-full bg-gray-100"></div>
              )}
            </div>

            <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
              SHEET INDEX
            </div>
            <table className="w-full text-[7px] border-collapse uppercase">
              <tbody>
                {[
                  { n: "T-001", t: "COVER" },
                  { n: "A-101", t: "SITE" },
                  { n: "E-201", t: "ELEC" },
                  { n: "E-202", t: "3-LINE" },
                ].map((s, i) => (
                  <tr key={i} className="border-b border-black">
                    <td className="border-r border-black p-0.5">{s.n}</td>
                    <td className="p-0.5">{s.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUB-COLUMN 2 - CONTRACTOR & INFO */}
          <div className="flex-1 flex flex-col">
            <div className="border-b-2 border-black p-1 text-center">
              <p className="font-bold text-[8px]">SOLAR BEAR ENERGY</p>
              <div className="w-8 h-8 mx-auto border border-black rounded-full flex items-center justify-center bg-gray-50 mt-1">
                🐻
              </div>
            </div>

            <div className="border-b-2 border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
                CONTRACTOR
              </div>
              <div className="p-1 text-[7px] text-center uppercase leading-tight">
                <p className="font-bold">
                  {contractorInfo.companyName || "SOLAR BEAR"}
                </p>
                <p>{contractorInfo.phone || "(570)-590-2327"}</p>
                <p className="text-[6px]">
                  {contractorInfo.address || "MILFORD, PA"}
                </p>
              </div>
            </div>

            <div className="border-b border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
                PROJECT INFO
              </div>
              <div className="p-1 text-[7px] uppercase leading-tight">
                <p className="font-bold">{projectInfo.customerName}</p>
                <p className="text-[6px]">{projectInfo.address}</p>
                <div className="mt-1 space-y-0.5">
                  <p>
                    <strong>DC:</strong> {projectInfo.systemSize}KWp
                  </p>
                  <p>
                    <strong>PARCEL:</strong> {projectInfo.parcelNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-black flex-1">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-[8px]">
                REVISION
              </div>
              <table className="w-full text-[6px] border-collapse uppercase text-center">
                <tbody>
                  <tr className="border-b border-black bg-gray-50 font-bold">
                    <td className="border-r border-black">SR</td>
                    <td className="border-r border-black">DATE</td>
                    <td>DESC</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black">1</td>
                    <td className="border-r border-black">02.25</td>
                    <td>INIT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
