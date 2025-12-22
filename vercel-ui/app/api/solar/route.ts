// import { NextRequest, NextResponse } from "next/server";
// import { findClosestBuilding, getDataLayerUrls } from "@/app/actions/solar_service";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const address = searchParams.get("address");

//   if (!address) {
//     return NextResponse.json({ error: "Address is required" }, { status: 400 });
//   }

//   try {
//     // 1️⃣ Geocode the address
//     const geoRes = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//         address
//       )}&key=${process.env.SOLAR_API}`
//     );
//     const geoData = await geoRes.json();

//     if (!geoData.results.length) {
//       return NextResponse.json({ error: "Address not found" }, { status: 404 });
//     }

//     const { lat, lng } = geoData.results[0].geometry.location;

//     // 2️⃣ Call Solar API
//     const solarData = await findClosestBuilding({ lat, lng }, process.env.SOLAR_API!);

//     // 3️⃣ Call Data Layers API (default 100m radius)
//     const dataLayers = await getDataLayerUrls({ lat, lng }, 100, process.env.SOLAR_API!);

//     return NextResponse.json({ address, lat, lng, solar: solarData, layers: dataLayers });
//   } catch (err: any) {
//     console.error("Solar API Error:", err);
//     return NextResponse.json(
//       { error: "Solar API Error", details: err.message || err },
//       { status: 500 }
//     );
//   }
// }
