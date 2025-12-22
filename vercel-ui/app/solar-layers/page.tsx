"use client";

import { useState, useEffect } from "react";
import GeoTiffViewer from "@/components/geotiff-viewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MapPin, ExternalLink } from "lucide-react";
import { getSolarData, SolarData } from "@/lib/solar-store";
import Link from "next/link";

interface DataLayers {
  imageryDate?: { year: number; month: number; day: number };
  imageryProcessedDate?: { year: number; month: number; day: number };
  dsmUrl?: string;
  rgbUrl?: string;
  maskUrl?: string;
  annualFluxUrl?: string;
  monthlyFluxUrl?: string;
  hourlyShadeUrls?: string[];
  imageryQuality?: string;
}

function LayerCard({ title, description, url }: { title: string; description: string; url: string }) {
  const proxyUrl = `/api/solar-image?url=${encodeURIComponent(url)}`;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="aspect-video bg-muted relative">
        <GeoTiffViewer url={url} title={title} className="w-full h-full" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <a
          href={proxyUrl}
          download={`${title.toLowerCase().replace(/\s/g, "_")}.tiff`}
          className="inline-block mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Download GeoTIFF
        </a>
      </div>
    </div>
  );
}

export default function SolarLayersPage() {
  const [data, setData] = useState<SolarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHour, setSelectedHour] = useState(0);

  // Load data from store on mount
  useEffect(() => {
    const storedData = getSolarData();
    if (storedData) {
      setData(storedData);
      console.log("📊 Loaded solar data from store:", storedData);
    }
    setLoading(false);

    // Listen for updates from the form page
    const handleUpdate = (event: CustomEvent<SolarData>) => {
      setData(event.detail);
      console.log("📊 Solar data updated:", event.detail);
    };

    window.addEventListener("solar-data-updated", handleUpdate as EventListener);
    return () => {
      window.removeEventListener("solar-data-updated", handleUpdate as EventListener);
    };
  }, []);

  const formatDate = (date?: { year: number; month: number; day: number }) => {
    if (!date) return "N/A";
    return new Date(date.year, date.month - 1, date.day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hourLabels = [
    "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
    "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Solar Data Layers</h1>
          <p className="text-muted-foreground text-lg">
            View satellite imagery and solar analysis data for your selected address.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">Loading Data</h3>
            <p className="text-muted-foreground">Checking for solar analysis data...</p>
          </div>
        )}

        {/* No Data State */}
        {!data && !loading && (
          <div className="text-center py-20">
            <MapPin className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Solar Data Available</h3>
            <p className="text-muted-foreground mb-6">
              Enter an address in the form to analyze solar potential.
            </p>
            <Link href="/forms">
              <Button>
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Form
              </Button>
            </Link>
          </div>
        )}

        {/* Data Display */}
        {data && !loading && (
          <>
            {/* Location Info */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">{data.address}</h2>
              <p className="text-muted-foreground">
                Coordinates: {data.lat.toFixed(6)}, {data.lng.toFixed(6)}
              </p>
            </div>

            {/* Metadata */}
            {data.layers && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">Imagery Date</div>
                  <div className="text-xl font-semibold text-foreground">
                    {formatDate(data.layers.imageryDate)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">Processed Date</div>
                  <div className="text-xl font-semibold text-foreground">
                    {formatDate(data.layers.imageryProcessedDate)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground">Imagery Quality</div>
                  <div className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        data.layers.imageryQuality === "HIGH"
                          ? "bg-green-500"
                          : data.layers.imageryQuality === "MEDIUM"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    {data.layers.imageryQuality || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {/* Solar Insights */}
            {data.solar?.solarPotential && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Solar Potential</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {data.solar.solarPotential.maxArrayPanelsCount}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Max Panels</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(data.solar.solarPotential.maxSunshineHoursPerYear)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Sun Hours/Year</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(data.solar.solarPotential.maxArrayAreaMeters2)} m²
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Usable Roof</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(data.solar.solarPotential.carbonOffsetFactorKgPerMwh)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">kg CO₂/MWh</div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Layers */}
            {data.layers && (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-4">Primary Layers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.layers.rgbUrl && (
                    <LayerCard
                      title="RGB Satellite"
                      description="High-resolution aerial imagery of the property."
                      url={data.layers.rgbUrl}
                    />
                  )}
                  {data.layers.dsmUrl && (
                    <LayerCard
                      title="Digital Surface Model"
                      description="3D elevation data showing roof heights and terrain."
                      url={data.layers.dsmUrl}
                    />
                  )}
                  {data.layers.maskUrl && (
                    <LayerCard
                      title="Building Mask"
                      description="Highlighted building footprint for the property."
                      url={data.layers.maskUrl}
                    />
                  )}
                  {data.layers.annualFluxUrl && (
                    <LayerCard
                      title="Annual Solar Flux"
                      description="Total yearly solar radiation received by the roof."
                      url={data.layers.annualFluxUrl}
                    />
                  )}
                  {data.layers.monthlyFluxUrl && (
                    <LayerCard
                      title="Monthly Solar Flux"
                      description="Monthly breakdown of solar radiation patterns."
                      url={data.layers.monthlyFluxUrl}
                    />
                  )}
                </div>

                {/* Hourly Shade Section */}
                {data.layers.hourlyShadeUrls && data.layers.hourlyShadeUrls.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Hourly Shade Analysis</h2>
                    <p className="text-muted-foreground mb-4">
                      View how shadows move across the roof throughout the day.
                    </p>

                    {/* Hour Selector */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {hourLabels.slice(0, data.layers.hourlyShadeUrls.length).map((label, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedHour(index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedHour === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Selected Hour Image */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        <GeoTiffViewer
                          url={data.layers.hourlyShadeUrls[selectedHour]}
                          title={`Shade at ${hourLabels[selectedHour]}`}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            Shade at {hourLabels[selectedHour]}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Shadow patterns on the roof surface
                          </p>
                        </div>
                        <a
                          href={`/api/solar-image?url=${encodeURIComponent(
                            data.layers.hourlyShadeUrls[selectedHour]
                          )}`}
                          download={`shade_${hourLabels[selectedHour].toLowerCase().replace(" ", "")}.tiff`}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    </div>

                    {/* All Hourly Shades Grid */}
                    <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
                      All Hourly Shade Maps
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {data.layers.hourlyShadeUrls.map((url: string, index: number) => (
                        <div
                          key={index}
                          onClick={() => setSelectedHour(index)}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedHour === index
                              ? "border-primary shadow-lg"
                              : "border-transparent hover:border-muted"
                          }`}
                        >
                          <div className="aspect-square bg-muted relative">
                            <GeoTiffViewer
                              url={url}
                              title={`Shade at ${hourLabels[index]}`}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="p-2 bg-card text-center">
                            <span className="text-sm font-medium text-foreground">
                              {hourLabels[index]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
