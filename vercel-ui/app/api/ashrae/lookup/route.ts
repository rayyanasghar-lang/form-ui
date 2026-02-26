import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8069"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const state = searchParams.get("state")
  const station = searchParams.get("station")
  const limit = searchParams.get("limit") || "1"

  if (!state || !station) {
    return NextResponse.json({ status: "error", message: "Missing state or station" }, { status: 400 })
  }

  try {
    const query = new URLSearchParams()
    query.append("state", state)
    query.append("station", station)
    query.append("limit", limit)

    const response = await fetch(`${API_BASE_URL}/api/ashrae?${query.toString()}`, {
      cache: 'no-store'
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("ASHRAE Proxy Error:", error)
    return NextResponse.json({ status: "error", message: "Failed to fetch ASHRAE data" }, { status: 500 })
  }
}
