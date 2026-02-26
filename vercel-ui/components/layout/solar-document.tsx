"use client";

import React from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

interface SolarDocumentProps {
  contractorInfo?: {
    companyName?: string;
    companyLogo?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    licenseNo?: string;
    hicNo?: string;
  };
  projectInfo?: {
    customerName?: string;
    address?: string;
    systemSize?: string;
    acSystemSize?: string;
    systemType?: string;
    parcelNumber?: string;
    utilityNo?: string;
    projectType?: string;
    exposureCategory?: string;
    snowLoad?: string;
    windSpeed?: string;
    occupancyCategory?: string;
    roofType?: string;
    rafterSize?: string;
    lotArea?: string;
    livingArea?: string;
    utilityMeter?: string;
    rackingInfo?: string;
    anchor?: string;
    jurisdiction?: string;
    roofArea?: string;
    roofAreaUnderPanels?: string;
    roofCoveringPercent?: string;
    areaOfWork?: string;
    hoa?: string;
    projectManager?: string;
  };
  coordinates?: {
    lat: number | null;
    lng: number | null;
  };
}

const libraries: "places"[] = ["places"];
const defaultCenter = { lat: 37.1143, lng: -79.9404 }; // Boones Mill, VA proxy
const mapFill = { width: "100%", height: "100%" };

export default function SolarDocument({
  contractorInfo = {},
  projectInfo = {},
  coordinates = { lat: null, lng: null },
}: SolarDocumentProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });
  const hasCoordinates = coordinates?.lat != null && coordinates?.lng != null;
  const center = hasCoordinates
    ? { lat: coordinates.lat as number, lng: coordinates.lng as number }
    : defaultCenter;

  return (
    <div
      className="w-[1100px] bg-white overflow-hidden border border-black text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* HEADER */}
      <div className="flex border-b border-black">
        <div className="flex-1 p-2 flex items-center justify-center">
          <h1 className="text-[14px] font-bold tracking-wide text-center uppercase">
            {projectInfo?.customerName || "HUGH G VINCENT"}'S{" "}
            {projectInfo?.systemSize || "18.04"}-KWp SOLAR SYSTEM INSTALLATION
          </h1>
        </div>
      </div>

      {/* MAIN 4-COLUMN LAYOUT */}
      <div className="flex min-h-[750px] text-[8px] uppercase">
        {/* COLUMN 1 - PROJECT DATA (28% width) */}
        <div className="w-[28%] border-r border-black flex flex-col">
          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            PROJECT DATA
          </div>
          <table className="w-full border-collapse text-[7.5px] text-left">
            <tbody>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold w-1/3"
                >
                  PROJECT ADDRESS
                </td>
                <td className="p-1 leading-tight">
                  {projectInfo?.address ||
                    "155 FOXRIDGE DR, BOONES MILL, VA 24065-4596"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan={2} className="border-r border-black p-1 font-bold">
                  OWNER
                </td>
                <td className="p-1">
                  {projectInfo?.customerName || "HUGH G VINCENT"}
                </td>
              </tr>

              <tr className="border-b border-black">
                <td
                  rowSpan={2}
                  className="border-r border-black p-1 font-bold text-center w-[25%]"
                >
                  SYSTEM
                  <br />
                  INTERCONNECTION
                </td>
                <td colSpan={2} className="p-1 border-b border-black">
                  LINESIDE CONNECTION (INSIDE METER BASE)
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan={2} className="p-1">
                  FUSED DISCONNECT
                </td>
              </tr>

              <tr className="border-b border-black">
                <td
                  rowSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  MAIN SERVICE PANEL
                </td>
                <td className="border-r border-black p-1 font-bold w-[35%]">
                  MSP BUSBAR
                  <br />
                  RATING
                </td>
                <td className="p-1">200A</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold">
                  MSP BREAKER
                  <br />
                  RATING
                </td>
                <td className="p-1">200A</td>
              </tr>

              <tr className="border-b border-black">
                <td
                  rowSpan={10}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  BUILDING
                  <br />
                  INFORMATION
                </td>
                <td className="border-r border-b border-black p-1 font-bold">
                  EXPOSURE CATEGORY
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.exposureCategory || "B"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  SNOW LOAD
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.snowLoad || "42 PSF"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  WIND SPEED
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.windSpeed || "110 MPH"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  OCCUPANCY CATEGORY
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.occupancyCategory || "II"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  PROJECT TYPE
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.projectType || "ROOF MOUNT / GROUND MOUNT"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  ROOF TYPE
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.roofType || "METAL ROOF"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  RAFTER SIZE
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.rafterSize || '2" X 4" @ 24"'}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  LOT AREA
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.lotArea || "7 ACRES"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-b border-black p-1 font-bold">
                  LIVING AREA
                </td>
                <td className="border-b border-black p-1">
                  {projectInfo?.livingArea || "2393 SQ FT"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold">
                  UTILITY METER
                </td>
                <td className="p-1">{projectInfo?.utilityMeter || "AEP"}</td>
              </tr>

              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  RACKING
                  <br />
                  INFORMATION
                </td>
                <td className="p-1">
                  {projectInfo?.rackingInfo ||
                    "UNIRAC NXT UMOUNT RAIL\nUNIRAC GFT RACKING"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  ANCHOR
                </td>
                <td className="p-1">
                  {projectInfo?.anchor ||
                    "UNIRAC STRONGHOLD BUTYL DRIVEN POSTS"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  JURISDICTION
                </td>
                <td className="p-1">
                  {projectInfo?.jurisdiction || "FRANKLIN COUNTY"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  AREA OF ROOF
                </td>
                <td className="p-1">
                  {projectInfo?.roofArea || "1527.27 SQ FT"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  ROOF AREA UNDER PANELS
                </td>
                <td className="p-1">
                  {projectInfo?.roofAreaUnderPanels || "547.1 SQ FT"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  % OF ROOF COVERING
                </td>
                <td className="p-1">
                  {projectInfo?.roofCoveringPercent || "35.52%"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  AREA OF WORK
                </td>
                <td className="p-1">
                  {projectInfo?.areaOfWork || "10418.18 SQ FT"}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  HOA
                </td>
                <td className="p-1">{projectInfo?.hoa || "N/A"}</td>
              </tr>
              <tr className="border-b border-black">
                <td
                  colSpan={2}
                  className="border-r border-black p-1 font-bold text-center"
                >
                  PROJECT MANAGER
                </td>
                <td className="p-1">
                  {projectInfo?.projectManager || "GUS ZIMMERMAN"}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            CODE REFERENCE
          </div>
          <ul className="p-2 space-y-1 list-none text-center leading-tight">
            <li>AMERICAN SOCIETY OF CIVIL ENGINEERS ASCE 7-22</li>
            <li>NATIONAL ELECTRICAL CODE, NEC 2020</li>
            <li>INTERNATIONAL RESIDENTIAL CODE, IRC 2021</li>
            <li>INTERNATIONAL BUILDING CODE, IBC 2021</li>
          </ul>
        </div>

        {/* COLUMN 2 - CENTER CONTENT (42% width) */}
        <div className="w-[42%] border-r border-black flex flex-col">
          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            GENERAL NOTES
          </div>
          <ol className="p-2 pl-6 space-y-1 list-decimal list-outside text-[7.5px] leading-tight border-b border-black">
            <li>
              ALL PV MODULES & WIRING SHALL BE PROTECTED FROM ANY PHYSICAL
              DAMAGES.
            </li>
            <li>
              ALL METALLIC COMPONENTS MUST BE GROUNDED FOR SAFETY PURPOSES.
            </li>
            <li>
              ALL EQUIPMENTS MUST MEET SETBACKS REQUIREMENTS AS REQUIRED BY NEC.
            </li>
            <li>ALL OCPDS RATINGS & TYPES SPECIFY ACCORDING TO NEC.</li>
            <li>
              LOAD SIDE INTERCONNECTION & SUPPLY SIDE TAP INTERCONNECTION
              ACCORDINGLY TO NEC.
            </li>
            <li>
              PV SYSTEM CIRCUIT INSTALLED IN BUILDING MUST INCLUDE A RAPID
              SHUTDOWN FUNCTION TO REDUCE SHOCK HAZARDS.
            </li>
            <li>
              EQUIPMENT GROUNDING CONDUCTOR ON AC & DC SIDE SIZED ACCORDING TO
              NEC.
            </li>
          </ol>

          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            SCOPE OF WORK
          </div>
          <div className="p-2 text-center border-b border-black">
            {projectInfo?.systemType || "GROUND MOUNT AND ROOF MOUNT"}{" "}
            {projectInfo?.systemSize || "18.04"}-KWP SOLAR SYSTEM WITH BATTERY
          </div>

          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            NEW EQUIPMENT
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-1 w-1/3">EQUIPMENT</th>
                <th className="border-r border-black p-1 w-1/3">
                  MAKE & MODEL
                </th>
                <th className="p-1 w-1/3">SPECIFICATION</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">SOLAR MODULE</td>
                <td className="border-r border-black p-1">
                  SEG SOLAR YUKON SERIES SEG-440-BTH-BG
                </td>
                <td className="p-1">WATTAGE: 440</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">SOLAR MODULE</td>
                <td className="border-r border-black p-1">-</td>
                <td className="p-1">-</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">INVERTER</td>
                <td className="border-r border-black p-1">
                  ENPHASE IQ8MC-72-M-US
                </td>
                <td className="p-1 leading-tight">
                  INPUT CURRENT: 14
                  <br />
                  OUTPUT CURRENT: 1.33
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">INVERTER</td>
                <td className="border-r border-black p-1">-</td>
                <td className="p-1">-</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">OPTIMIZER</td>
                <td className="border-r border-black p-1">-</td>
                <td className="p-1">-</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">BATTERY</td>
                <td className="border-r border-black p-1">
                  ENPHASE IQ BATTERY 10C
                </td>
                <td className="p-1">USABLE ENERGY: 10</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">BATTERY</td>
                <td className="border-r border-black p-1">-</td>
                <td className="p-1">-</td>
              </tr>
            </tbody>
          </table>

          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            MONITORING DEVICE
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-1 w-1/3">EQUIPMENT</th>
                <th className="border-r border-black p-1 w-1/3">
                  MAKE & MODEL
                </th>
                <th className="p-1 w-1/3">NOTES</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2">-</td>
                <td className="border-r border-black p-2">-</td>
                <td className="p-2">-</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2">-</td>
                <td className="border-r border-black p-2">-</td>
                <td className="p-2">-</td>
              </tr>
            </tbody>
          </table>

          <div className="border-b border-black p-1 font-bold text-center text-[9px]">
            EXISTING EQUIPMENT
          </div>
          <table className="w-full text-center border-collapse">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 w-1/3">METER</td>
                <td className="border-r border-black p-1 w-1/3">AEP</td>
                <td className="p-1 w-1/3">UTILITY SERVICE</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-1">
                  MAIN SERVICE PANEL
                </td>
                <td className="border-r border-black p-1">-</td>
                <td className="p-1">200A BUSBAR</td>
              </tr>
            </tbody>
          </table>

          <div className="border-b border-black p-1 font-bold text-center text-[9px] flex-grow-0">
            RELATED NOTE
          </div>
          <div className="p-3 text-center flex-1 flex items-center justify-center">
            <p>
              ACCORDING TO NEC CODE 2020, AS THE PANEL COVERAGE IS LESS THAN 33%
              OF THE ENTIRE ROOF, 18-INCH SETBACK WILL BE PROVIDED ACCORDINGLY.
            </p>
          </div>
        </div>

        {/* COLUMN 3 - MAPS & INDEX (16% width) */}
        <div className="w-[16%] border-r border-black flex flex-col">
          <div className="border-b border-black p-1 font-bold text-center">
            SATELLITE VIEW
          </div>
          <div className="h-[150px] relative border-b border-black">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapFill}
                center={center}
                zoom={19}
                options={{ mapTypeId: "satellite", disableDefaultUI: true }}
              >
                {hasCoordinates && <MarkerF position={center} />}
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-gray-200"></div>
            )}
          </div>

          <div className="border-b border-black p-1 font-bold text-center">
            VICINITY MAP
          </div>
          <div className="h-[150px] relative border-b border-black">
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

          <div className="border-b border-black p-1 font-bold text-center">
            SHEET INDEX
          </div>
          <table className="w-full text-center border-collapse flex-1">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-1 w-[40%]">
                  SHEET NUMBER
                </th>
                <th className="p-1 w-[60%]">SHEET TITLE</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: "T-001", t: "COVER PAGE" },
                { n: "A-101", t: "SITE PLAN" },
                { n: "A-102", t: "ATTACHMENT PLAN" },
                { n: "E-201", t: "ELECTRICAL PLAN" },
                { n: "E-202", t: "3-LINE DIAGRAM" },
                { n: "E-203", t: "DESIGN TABLE" },
                { n: "E-204", t: "PLACARDS" },
                { n: "S-301", t: "ASSEMBLY DETAILS" },
                { n: "SP-401", t: "SAFETY PLAN" },
                { n: "BOM", t: "BILL OF MATERIAL" },
                { n: "R-001", t: "RESOURCE DOCUMENT" },
                { n: "R-002", t: "RESOURCE DOCUMENT" },
                { n: "R-003", t: "RESOURCE DOCUMENT" },
                { n: "R-004", t: "RESOURCE DOCUMENT" },
                { n: "R-005", t: "RESOURCE DOCUMENT" },
                { n: "R-006", t: "RESOURCE DOCUMENT" },
              ].map((s, i) => (
                <tr key={i} className="border-b border-black last:border-0">
                  <td className="border-r border-black py-0.5">{s.n}</td>
                  <td className="py-0.5">{s.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COLUMN 4 - CONTRACTOR & REVISIONS (14% width) */}
        <div className="w-[14%] flex flex-col">
          {/* Logo Section */}
          <div className="h-[100px] border-b border-black p-2 flex items-center justify-center flex-col relative">
            <div className="text-[14px] font-bold text-blue-900 tracking-tighter italic">
              <span className="text-yellow-500">SOL</span>SHINE
            </div>
            <div className="text-[12px] font-bold text-blue-900 tracking-widest mt-[-2px]">
              ENERGY
            </div>
          </div>

          <div className="border-b border-black text-center">
            <div className="border-b border-black p-1 font-bold">
              CONTRACTOR
            </div>
            <div className="p-2 space-y-1">
              <p className="font-bold">
                {contractorInfo?.companyName ||
                  "SOLSHINE ENERGY ALTERNATIVES, LLC"}
              </p>
              <p>{contractorInfo?.phone || "(540)-235-3095"}</p>
              <p className="leading-tight">
                {contractorInfo?.address ||
                  "5670 STARKEY RD, ROANOKE, VA 24018"}
              </p>
              <p>
                LICENSE NO.
                <br />
                HIC NO: {contractorInfo?.hicNo || "2705147660"}
              </p>
            </div>
          </div>

          <div className="border-b border-black text-center">
            <div className="border-b border-black p-1 font-bold">
              PROJECT INFO
            </div>
            <div className="p-2 space-y-1">
              <p className="font-bold">
                {projectInfo?.customerName || "HUGH G VINCENT"}
              </p>
              <p className="leading-tight">
                {projectInfo?.address ||
                  "155 FOXRIDGE DR, BOONES MILL, VA 24065-4596"}
              </p>
              <p className="font-bold mt-2">
                DC SYSTEM SIZE:
                <br />
                {projectInfo?.systemSize || "18.04"}KWP
              </p>
              <p className="font-bold">
                AC SYSTEM SIZE:
                <br />
                {projectInfo?.acSystemSize || "13.12"}KWP
              </p>
              <p className="mt-2">
                PARCEL NO:
                <br />
                {projectInfo?.parcelNumber || "0370004501"}
              </p>
              <p>
                UTILITY NO:
                <br />
                {projectInfo?.utilityNo || "021-536-009-3-3"}
              </p>
            </div>
          </div>

          <div className="border-b border-black text-center flex-1 flex flex-col">
            <div className="border-b border-black p-1 font-bold">
              ENGINEER OF DESIGN
            </div>
            <div className="flex-1 min-h-[50px]"></div>
          </div>

          <div className="border-b border-black text-center p-1">
            PAGE SIZE: 11" x 17" (ANSI B)
          </div>
          <div className="border-b border-black text-center p-1 font-bold text-[10px]">
            COVER PAGE
          </div>
          <div className="border-b border-black text-center p-1 font-bold text-[10px]">
            T-001
          </div>
          <div className="border-b border-black text-center p-1 font-bold">
            SHEET 1
          </div>
          <div className="border-b border-black p-1 pl-2 font-bold">
            DESIGN BY: N.C
          </div>
          <div className="border-b border-black p-1 pl-2 font-bold">
            CHECKED BY: T.H
          </div>

          <div className="flex-1 flex flex-col">
            <div className="border-b border-black p-1 font-bold text-center">
              REVISION BLOCK
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-black font-bold">
                  <th className="border-r border-black py-1">SR NO.</th>
                  <th className="border-r border-black py-1">DATE</th>
                  <th className="py-1">DESCRI.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black py-1">1</td>
                  <td className="border-r border-black py-1">02/24/26</td>
                  <td className="py-1">INITIAL</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black py-1">2</td>
                  <td className="border-r border-black py-1"></td>
                  <td className="py-1"></td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black py-1">3</td>
                  <td className="border-r border-black py-1"></td>
                  <td className="py-1"></td>
                </tr>
                <tr>
                  <td className="border-r border-black py-1">4</td>
                  <td className="border-r border-black py-1"></td>
                  <td className="py-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
