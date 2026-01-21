
import { NextRequest, NextResponse } from "next/server"

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://host.docker.internal:8069"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> } // Correct type for dynamic route params
) {
  const { type } = await params
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "10"
  const q = searchParams.get("q") || ""

  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Keep no-store to ensure fresh data for pagination/search
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error fetching equipment list for ${type}:`, error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  try {
    const body = await request.json()
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      try {
        const errorJson = JSON.parse(errorText)
         return NextResponse.json(errorJson, { status: res.status })
      } catch (e) {
          return NextResponse.json(
          { error: `Backend returned ${res.status}: ${errorText}` },
          { status: res.status }
        )
      }
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error creating equipment for ${type}:`, error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
