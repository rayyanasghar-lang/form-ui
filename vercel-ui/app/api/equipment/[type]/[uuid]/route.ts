
import { NextRequest, NextResponse } from "next/server"

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://host.docker.internal:8069"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; uuid: string }> }
) {
  const { type, uuid } = await params
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
    console.error(`[API] Error fetching single equipment ${type}/${uuid}:`, error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; uuid: string }> }
) {
  const { type, uuid } = await params
  try {
    const body = await request.json()
    console.log(`[API] sending PUT to ${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`)
    const bodyStr = JSON.stringify(body)
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyStr,
    })

    const resText = await res.text()
    console.log(`[API] Response from backend (${res.status}):`, resText)

    if (!res.ok) {
       console.error(`[API] Backend error ${res.status}: ${resText}`)
        try {
            const errorJson = JSON.parse(resText)
             return NextResponse.json(errorJson, { status: res.status })
        } catch (e) {
             return NextResponse.json(
                { error: `Backend returned ${res.status}: ${resText}` },
                { status: res.status }
              )
        }
    }

    let data
    try {
        data = JSON.parse(resText)
    } catch (e) {
        // Handle non-JSON success response if any
        data = { message: resText }
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error updating equipment ${type}/${uuid}:`, error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; uuid: string }> }
  ) {
    const { type, uuid } = await params
    try {
      const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error(`[API] Error deleting equipment ${type}/${uuid}:`, error)
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      )
    }
  }
