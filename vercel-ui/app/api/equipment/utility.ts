import { NextRequest, NextResponse } from "next/server"

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://host.docker.internal:8069"

export async function proxyList(request: NextRequest, type: string) {
  const { searchParams } = new URL(request.url)
  const internalUrl = new URL(`${INTERNAL_API_URL}/api/equipment/${type}`)
  
  searchParams.forEach((value, key) => {
    internalUrl.searchParams.append(key, value)
  })

  if (!internalUrl.searchParams.has("page")) internalUrl.searchParams.set("page", "1")
  if (!internalUrl.searchParams.has("limit")) internalUrl.searchParams.set("limit", "10")

  try {
    const res = await fetch(internalUrl.toString(), {
      headers: { "Content-Type": "application/json" },
      cache: "no-store", 
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error fetching equipment list for ${type}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function proxyCreate(request: NextRequest, type: string) {
  try {
    const body = await request.json()
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(errorJson, { status: res.status })
      } catch (e) {
        return NextResponse.json({ error: `Backend returned ${res.status}: ${errorText}` }, { status: res.status })
      }
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error creating equipment for ${type}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function proxyDetail(request: NextRequest, type: string, uuid: string) {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error fetching single equipment ${type}/${uuid}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function proxyUpdate(request: NextRequest, type: string, uuid: string) {
  try {
    const body = await request.json()
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const resText = await res.text()
    if (!res.ok) {
        try {
            const errorJson = JSON.parse(resText)
            return NextResponse.json(errorJson, { status: res.status })
        } catch (e) {
            return NextResponse.json({ error: `Backend returned ${res.status}: ${resText}` }, { status: res.status })
        }
    }

    let data
    try {
        data = JSON.parse(resText)
    } catch (e) {
        data = { message: resText }
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error updating equipment ${type}/${uuid}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function proxyDelete(request: NextRequest, type: string, uuid: string) {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/equipment/${type}/${uuid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API] Error deleting equipment ${type}/${uuid}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
