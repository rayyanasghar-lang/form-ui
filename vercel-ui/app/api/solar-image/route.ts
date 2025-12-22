import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint to fetch GeoTIFF images from Google Solar API.
 * The GeoTIFF URLs require API key authentication and need to be proxied.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  try {
    // Append API key to the URL
    const urlWithKey = `${imageUrl}&key=${process.env.SOLAR_API}`;
    
    const response = await fetch(urlWithKey);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image", status: response.status },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/tiff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Image proxy error:", err);
    return NextResponse.json(
      { error: "Failed to proxy image", details: err.message },
      { status: 500 }
    );
  }
}
