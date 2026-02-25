"use client";

export default function SolarDocumentPage() {
  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      {/* HEADER */}
      <div className="flex h-12 border-b-2 border-black">
        <div className="flex-1 border-r-2 border-black p-2 flex items-center justify-center">
          <h1 className="text-sm font-bold tracking-wide text-center">
            KEVIN MEYERS'S 18.45-KWp SOLAR SYSTEM INSTALLATION
          </h1>
        </div>
      </div>

      {/* MAIN THREE-COLUMN LAYOUT */}
      <div className="flex h-[calc(100vh-48px)] border-2 border-t-0 border-black">
        {/* LEFT COLUMN - PROJECT DATA */}
        <div className="w-96 border-r-2 border-black overflow-y-auto">
          <div className="border-b-2 border-black p-2 bg-gray-100 text-center font-bold text-xs sticky top-0 z-10">
            PROJECT DATA
          </div>

          <table className="w-full text-xs border-collapse">
            <tbody>
              {/* PROJECT ADDRESS */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  PROJECT ADDRESS
                </td>
                <td className="p-1">
                  292 DUNN RD,
                  <br />
                  HONESDALE, PA 18731
                </td>
              </tr>

              {/* OWNER */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  OWNER
                </td>
                <td className="p-1">KEVIN MEYERS</td>
              </tr>

              {/* SYSTEM INTERCONNECTION */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  SYSTEM
                  <br />
                  INTERCONNECTION
                </td>
                <td className="p-1">LINESIDE CONNECTION (INSIDE MSP)</td>
              </tr>

              {/* FUSED DISCONNECT */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50"></td>
                <td className="p-1">FUSED DISCONNECT</td>
              </tr>

              {/* MAIN SERVICE PANEL - PARENT ROW */}
              <tr className="border-b border-black">
                <td
                  rowSpan="3"
                  className="border-r border-black p-1 font-bold bg-gray-50"
                >
                  MAIN SERVICE PANEL
                </td>
                <td className="border-b border-black p-1">
                  MSP BUSBAR RATING<span className="float-right">200A</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-1">
                  MSP BREAKER RATING<span className="float-right">200A</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-1">
                  EXPOSURE CATEGORY<span className="float-right">C</span>
                </td>
              </tr>

              {/* SNOW LOAD */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  SNOW LOAD
                </td>
                <td className="p-1">40 PSF</td>
              </tr>

              {/* WIND SPEED */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  WIND SPEED
                </td>
                <td className="p-1">115 MPH</td>
              </tr>

              {/* OCCUPANCY CATEGORY */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  OCCUPANCY CATEGORY
                </td>
                <td className="p-1">II</td>
              </tr>

              {/* BUILDING INFORMATION - PARENT ROW WITH NESTED ITEMS */}
              <tr className="border-b border-black">
                <td
                  rowSpan="6"
                  className="border-r border-black p-1 font-bold bg-gray-50"
                >
                  BUILDING INFORMATION
                </td>
                <td className="border-b border-black p-1">
                  PROPERTY TYPE<span className="float-right">RESIDENTIAL</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-1">
                  ROOF TYPE<span className="float-right">ASPHALT SHINGLE</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-1">
                  RAFTER SIZE<span className="float-right">2" X 4" @ 24"</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-1">
                  LOT AREA<span className="float-right">9 ACRES</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-b border-black p-1">
                  LIVING AREA<span className="float-right">2446 SQ FT</span>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-1">
                  UTILITY METER<span className="float-right">PPL</span>
                </td>
              </tr>

              {/* RACKING INFORMATION */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  RACKING INFORMATION
                </td>
                <td className="p-1">IRONRIDGE XR-100</td>
              </tr>

              {/* ANCHOR */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  ANCHOR
                </td>
                <td className="p-1">IRONRIDGE HUG</td>
              </tr>

              {/* JURISDICTION */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  JURISDICTION
                </td>
                <td className="p-1">BERLIN TOWNSHIP</td>
              </tr>

              {/* AREA OF ROOF */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  AREA OF ROOF
                </td>
                <td className="p-1">3781.21 SQ FT</td>
              </tr>

              {/* ROOF AREA UNDER PANELS */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  ROOF AREA UNDER PANELS
                </td>
                <td className="p-1">102.61 SQ FT</td>
              </tr>

              {/* % OF ROOF COVERING */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  % OF ROOF COVERING
                </td>
                <td className="p-1">21.23%</td>
              </tr>

              {/* AREA OF WORK */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  AREA OF WORK
                </td>
                <td className="p-1">1642.87 SQ FT</td>
              </tr>

              {/* HOA */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  HOA
                </td>
                <td className="p-1">N/A</td>
              </tr>

              {/* PROJECT MANAGER */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">
                  PROJECT MANAGER
                </td>
                <td className="p-1">CHRIS CONNELLY</td>
              </tr>

              {/* CODE REFERENCE */}
              <tr className="border-b border-black">
                <td
                  className="border-r border-black p-1 font-bold bg-gray-50"
                  colSpan="2"
                >
                  CODE REFERENCE
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="2" className="border-r border-black p-1">
                  AMERICAN SOCIETY OF CIVIL ENGINEERS ASCE 7-16
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="2" className="border-r border-black p-1">
                  NATIONAL ELECTRICAL CODE, NEC 2017
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="2" className="border-r border-black p-1">
                  INTERNATIONAL RESIDENTIAL CODE, IRC 2018
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="2" className="border-r border-black p-1">
                  INTERNATIONAL BUILDING CODE, IBC 2018
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CENTER COLUMN - GENERAL NOTES & SPECIFICATIONS */}
        <div className="flex-1 border-r-2 border-black overflow-y-auto">
          {/* GENERAL NOTES */}
          <div className="border-b-2 border-black">
            <div className="border-b border-black p-2 bg-gray-100 text-center font-bold text-xs">
              GENERAL NOTES
            </div>
            <ol className="text-xs p-2 space-y-0.5 list-decimal list-inside">
              <li>
                ALL PV MODULES & WIRING SHALL BE PROTECTED FROM ANY PHYSICAL
                DAMAGES.
              </li>
              <li>
                ALL METALLIC COMPONENTS MUST BE GROUNDED FOR SAFETY PURPOSES.
              </li>
              <li>
                ALL EQUIPMENT MUST MEET SETBACKS REQUIREMENTS AS EQUIPPED BY
                NEC.
              </li>
              <li>ALL OCDS RATINGS & TYPES SPECIFY ACCORDING TO NEC.</li>
              <li>
                LOAD SIDE INTERCONNECTION & SUPPLY SIDE TAP CONNECTION
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
          </div>

          {/* SCOPE OF WORK */}
          <div className="border-b-2 border-black">
            <div className="border-b border-black p-2 bg-gray-100 text-center font-bold text-xs">
              SCOPE OF WORK
            </div>
            <div className="p-2 text-xs text-center font-bold border-b border-black">
              ROOF MOUNT 18.45-KWp SOLAR SYSTEM WITHOUT BATTERY
            </div>
          </div>

          {/* NEW EQUIPMENT */}
          <div className="border-b-2 border-black">
            <div className="border-b border-black p-2 bg-gray-100 text-center font-bold text-xs">
              NEW EQUIPMENT
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border-r border-black p-1 font-bold text-left text-xs">
                    EQUIPMENT
                  </th>
                  <th className="border-r border-black p-1 font-bold text-left text-xs">
                    MAKE & MODEL
                  </th>
                  <th className="p-1 font-bold text-left text-xs">
                    SPECIFICATION
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    eq: "SOLAR MODULE",
                    make: "MAXEON 3 SPA-MAX3-410-BLK",
                    spec: "WATTAGE: 410",
                  },
                  { eq: "SOLAR MODULE", make: "-", spec: "-" },
                  {
                    eq: "INVERTER",
                    make: "ENPHASE IQ8A-72-2-US",
                    spec: "INPUT CURRENT:12 OUTPUT CURRENT:1.45",
                  },
                  { eq: "INVERTER", make: "-", spec: "-" },
                  { eq: "OPTIMIZER", make: "-", spec: "-" },
                  { eq: "BATTERY", make: "-", spec: "-" },
                  { eq: "BATTERY", make: "-", spec: "-" },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r border-black p-1 text-xs">
                      {row.eq}
                    </td>
                    <td className="border-r border-black p-1 text-xs">
                      {row.make}
                    </td>
                    <td className="p-1 text-xs">{row.spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MONITORING DEVICE */}
          <div className="border-b-2 border-black">
            <div className="border-b border-black p-2 bg-gray-100 text-center font-bold text-xs">
              MONITORING DEVICE
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border-r border-black p-1 font-bold text-left text-xs">
                    EQUIPMENT
                  </th>
                  <th className="border-r border-black p-1 font-bold text-left text-xs">
                    MAKE & MODEL
                  </th>
                  <th className="p-1 font-bold text-left text-xs">NOTES</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 text-xs">-</td>
                  <td className="border-r border-black p-1 text-xs">-</td>
                  <td className="p-1 text-xs">-</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 text-xs"></td>
                  <td className="border-r border-black p-1 text-xs"></td>
                  <td className="p-1 text-xs"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* EXISTING EQUIPMENT */}
          <div className="border-b-2 border-black">
            <div className="border-b border-black p-2 bg-gray-100 text-center font-bold text-xs">
              EXISTING EQUIPMENT
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border-r border-black p-1 font-bold text-left text-xs">
                    METER
                  </th>
                  <th className="border-r border-black p-1 font-bold text-left text-xs">
                    PPL
                  </th>
                  <th className="p-1 font-bold text-left text-xs">
                    UTILITY SERVICE
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 text-xs">
                    MAIN SERVICE PANEL
                  </td>
                  <td className="border-r border-black p-1 text-xs">-</td>
                  <td className="p-1 text-xs">200A BUSBAR</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 text-xs">-</td>
                  <td className="border-r border-black p-1 text-xs">-</td>
                  <td className="p-1 text-xs">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* RELATED NOTE */}
          <div>
            <div className="border-b border-black p-2 bg-gray-100 text-center font-bold text-xs">
              RELATED NOTE
            </div>
            <p className="text-xs p-2 text-center">
              ACCORDING TO NEC CODE 2017, AS THE PANEL COVERAGE IS LESS THAN 33%
              OF THE ENTIRE ROOF, 18-INCH SETBACK WILL BE PROVIDED ACCORDINGLY.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN - TWO SUB-COLUMNS */}
        <div className="flex border-l-2 border-black flex-1">
          {/* LEFT SUB-COLUMN: SATELLITE VIEW, VICINITY MAP, SHEET INDEX */}
          <div className="w-48 border-r-2 border-black overflow-y-auto flex flex-col">
            {/* SATELLITE VIEW */}
            <div className="border-b-2 border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                SATELLITE VIEW
              </div>
              <div className="w-full h-24 bg-gradient-to-br from-green-600 via-green-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                [Satellite Image]
              </div>
            </div>

            {/* VICINITY MAP */}
            <div className="border-b-2 border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                VICINITY MAP
              </div>
              <div className="w-full h-24 bg-gradient-to-b from-green-200 to-blue-300 flex items-center justify-center text-gray-600 text-xs font-bold">
                [Map with Pin]
              </div>
            </div>

            {/* SHEET INDEX */}
            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                SHEET INDEX
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border-r border-black p-0.5 font-bold text-left text-xs">
                      SHEET NO
                    </th>
                    <th className="p-0.5 font-bold text-left text-xs">TITLE</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { num: "T-001", title: "COVER PAGE" },
                    { num: "A-101", title: "SITE PLAN" },
                    { num: "A-102", title: "ATTACH PLAN" },
                    { num: "E-201", title: "ELEC PLAN" },
                    { num: "E-202", title: "3-LINE DIA" },
                    { num: "E-203", title: "DESIGN TBL" },
                    { num: "E-204", title: "PLACARDS" },
                    { num: "S-301", title: "ASSEM DET" },
                    { num: "SP-401", title: "SAFETY PL" },
                    { num: "BOM", title: "BOM" },
                    { num: "R-001", title: "RES DOC" },
                    { num: "R-002", title: "RES DOC" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-0.5 text-xs">
                        {row.num}
                      </td>
                      <td className="p-0.5 text-xs">{row.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT SUB-COLUMN: CONTRACTOR INFO */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* SOLAR BEAR LOGO & NAME */}
            <div className="border-b-2 border-black p-2 text-center">
              <p className="font-bold text-xs mb-2">SOLAR BEAR ENERGY</p>
              <div className="w-12 h-12 mx-auto border border-black rounded-full flex items-center justify-center bg-gray-100">
                🐻
              </div>
            </div>

            {/* CONTRACTOR */}
            <div className="border-b-2 border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                CONTRACTOR
              </div>
              <div className="p-1.5 bg-gray-50 text-center">
                <p className="font-bold text-xs mb-0.5">SOLAR BEAR ENERGY</p>
                <p className="text-xs">(570)-590-2327</p>
                <p className="text-xs">
                  301 E HARFORD ST,
                  <br />
                  MILFORD, PA 18337
                </p>
                <p className="text-xs mt-0.5">
                  LICENSE NO.
                  <br />
                  NJ HIC: 13VH1633500
                  <br />
                  PA LIC: PA124848
                </p>
              </div>
            </div>

            {/* PROJECT INFO */}
            <div className="border-b-2 border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                PROJECT INFO
              </div>
              <div className="p-1.5 bg-white text-xs">
                <p className="font-bold text-xs mb-0.5">KEVIN MEYERS</p>
                <p className="text-xs">
                  292 DUNN RD,
                  <br />
                  HONESDALE, PA 18731
                </p>
                <p className="text-xs mt-1">
                  <strong>DC SYSTEM SIZE:</strong>
                  <br />
                  18.45kWp
                  <br />
                  <strong>AC SYSTEM SIZE:</strong>
                  <br />
                  15.76kWp
                  <br />
                  <strong>PARCEL NO.:</strong>
                  <br />
                  01-0-0033-0001
                  <br />
                  <strong>UTILITY NO.:</strong>
                  <br />
                  S827-40004
                </p>
              </div>
            </div>

            {/* ENGINEER OF DESIGN */}
            <div className="border-b-2 border-black">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                ENGINEER OF DESIGN
              </div>
              <div className="p-2 bg-white text-center">
                <p className="text-xs mb-1">Fischer Pantel</p>
                <div className="w-14 h-14 mx-auto border border-black rounded-full flex items-center justify-center bg-gray-100 text-xs font-bold">
                  [Stamp]
                </div>
              </div>
            </div>

            {/* REVISION BLOCK */}
            <div className="flex-1">
              <div className="border-b border-black p-1 bg-gray-100 text-center font-bold text-xs">
                REVISION BLOCK
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border-r border-black p-0.5 font-bold text-center text-xs">
                      SR
                    </th>
                    <th className="border-r border-black p-0.5 font-bold text-center text-xs">
                      DATE
                    </th>
                    <th className="p-0.5 font-bold text-center text-xs">
                      DESC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border-r border-black p-0.5 text-center">
                      1
                    </td>
                    <td className="border-r border-black p-0.5 text-center">
                      11.13.25
                    </td>
                    <td className="p-0.5 text-center">INITIAL</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black p-0.5 text-center">
                      2
                    </td>
                    <td className="border-r border-black p-0.5"></td>
                    <td className="p-0.5"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black p-0.5 text-center">
                      3
                    </td>
                    <td className="border-r border-black p-0.5"></td>
                    <td className="p-0.5"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black p-0.5 text-center">
                      4
                    </td>
                    <td className="border-r border-black p-0.5"></td>
                    <td className="p-0.5"></td>
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
