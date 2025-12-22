"use client";

import { useEffect, useRef, useState } from "react";
import * as GeoTIFF from "geotiff";

interface GeoTiffViewerProps {
  url: string;
  title: string;
  className?: string;
}

export default function GeoTiffViewer({ url, title, className = "" }: GeoTiffViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeoTiff = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the GeoTIFF through our proxy
        const proxyUrl = `/api/solar-image?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const width = image.getWidth();
        const height = image.getHeight();
        const rasters = await image.readRasters();

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Handle different raster types
        const numBands = rasters.length;

        if (numBands >= 3) {
          // RGB or RGBA image
          const r = rasters[0] as Uint8Array | Uint16Array | Float32Array;
          const g = rasters[1] as Uint8Array | Uint16Array | Float32Array;
          const b = rasters[2] as Uint8Array | Uint16Array | Float32Array;

          // Find min/max for normalization
          let rMin = Infinity, rMax = -Infinity;
          let gMin = Infinity, gMax = -Infinity;
          let bMin = Infinity, bMax = -Infinity;

          for (let i = 0; i < r.length; i++) {
            if (r[i] < rMin) rMin = r[i];
            if (r[i] > rMax) rMax = r[i];
            if (g[i] < gMin) gMin = g[i];
            if (g[i] > gMax) gMax = g[i];
            if (b[i] < bMin) bMin = b[i];
            if (b[i] > bMax) bMax = b[i];
          }

          for (let i = 0; i < r.length; i++) {
            const idx = i * 4;
            // Normalize to 0-255
            data[idx] = Math.round(((r[i] - rMin) / (rMax - rMin)) * 255);
            data[idx + 1] = Math.round(((g[i] - gMin) / (gMax - gMin)) * 255);
            data[idx + 2] = Math.round(((b[i] - bMin) / (bMax - bMin)) * 255);
            data[idx + 3] = 255;
          }
        } else {
          // Single band (grayscale or flux data) - apply color map
          const band = rasters[0] as Uint8Array | Uint16Array | Float32Array;

          // Find min/max for normalization
          let min = Infinity, max = -Infinity;
          for (let i = 0; i < band.length; i++) {
            if (band[i] !== 0 && isFinite(band[i])) {
              if (band[i] < min) min = band[i];
              if (band[i] > max) max = band[i];
            }
          }

          // Apply a heat map color scheme for flux data
          for (let i = 0; i < band.length; i++) {
            const idx = i * 4;
            const value = band[i];

            if (value === 0 || !isFinite(value)) {
              // Transparent for no data
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 0;
            } else {
              // Normalize to 0-1
              const normalized = (value - min) / (max - min);

              // Heat map: blue -> cyan -> green -> yellow -> red
              let r = 0, g = 0, b = 0;
              if (normalized < 0.25) {
                b = 255;
                g = Math.round(normalized * 4 * 255);
              } else if (normalized < 0.5) {
                g = 255;
                b = Math.round((0.5 - normalized) * 4 * 255);
              } else if (normalized < 0.75) {
                g = 255;
                r = Math.round((normalized - 0.5) * 4 * 255);
              } else {
                r = 255;
                g = Math.round((1 - normalized) * 4 * 255);
              }

              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255;
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setLoading(false);
      } catch (err: any) {
        console.error("GeoTIFF Error:", err);
        setError(err.message || "Failed to load image");
        setLoading(false);
      }
    };

    loadGeoTiff();
  }, [url]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="text-muted-foreground text-sm">Loading {title}...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-destructive text-sm text-center p-4">
            <p>Failed to load</p>
            <p className="text-xs mt-1 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain ${loading || error ? "invisible" : ""}`}
      />
    </div>
  );
}
