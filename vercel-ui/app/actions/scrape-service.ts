"use server"

import { fetchNearbyStations, geocodeAddress } from "./weather-service";
import { fetchProjectsAction, updateProjectAction } from "./project-service";
import { toast } from "sonner";

/**
 * Scrape AHJ (Jurisdiction) from Census Geocoder
 */
export async function scrapeAHJAction(lat: number, lng: number) {
    try {
        console.log(`[ScrapeService] Fetching AHJ for: ${lat}, ${lng}`);
        // Census API can be unstable; use a shorter timeout and specific headers
        const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng.toFixed(6)}&y=${lat.toFixed(6)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
        
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Sunpermit-App; contact@example.com)",
                "Accept": "application/json"
            },
            signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "Unknown error");
            console.error(`[ScrapeService] AHJ API Error: ${response.status}`, errText);
            throw new Error(`Census API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const geographies = data.result?.geographies;
        
        if (!geographies || Object.keys(geographies).length === 0) {
            console.warn(`[ScrapeService] AHJ: No geographies for ${lat}, ${lng}`);
            return { success: false, error: "No geography data found at these coordinates" };
        }

        // AHJ Logic: Prefer Incorporated Places, then County Subdivisions, then Counties
        const place = geographies["Incorporated Places"]?.[0]?.NAME;
        const subDiv = geographies["County Subdivisions"]?.[0]?.NAME;
        const county = geographies["Counties"]?.[0]?.NAME;

        const jurisdiction = place || subDiv || county || "Unknown";

        return {
            success: true,
            data: {
                jurisdiction,
                place: place || "N/A",
                countySubdivision: subDiv || "N/A",
                county: county || "N/A",
                fullData: geographies
            }
        };
    } catch (error: any) {
        console.error("[ScrapeService] AHJ Error:", error.message || error);
        return { success: false, error: error.name === 'TimeoutError' ? "Census API timed out" : (error.message || "Fetch failed") };
    }
}

/**
 * Scrape Utility Info from NREL
 */
export async function scrapeUtilityAction(lat: number, lng: number) {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const apiKey = process.env.NREL_API_KEY || "DEMO_KEY";
            const url = `https://developer.nrel.gov/api/utility_rates/v3.json?api_key=${apiKey}&lat=${lat}&lon=${lng}`;
            const maskedUrl = url.replace(apiKey, "REDACTED");
            
            console.log(`[ScrapeService] Utility Fetch Attempt ${attempt}/${maxRetries} for: ${lat}, ${lng} (API: ${apiKey === "DEMO_KEY" ? "DEMO" : "PROD"})`);
            
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Sunpermit-App; contact@example.com)",
                    "Accept": "application/json"
                },
                signal: AbortSignal.timeout(10000) // 10s timeout
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => "Unknown error");
                console.error(`[ScrapeService] Utility API Error (${response.status}):`, errText);
                throw new Error(`NREL API Error: ${response.status}`);
            }
            
            const data = await response.json();
            const outputs = data.outputs;

            if (!outputs || (!outputs.utility_name && !outputs.utility)) {
                console.warn(`[ScrapeService] Utility: No data found at ${lat}, ${lng}`);
                return { success: false, error: "No utility provider found for this location" };
            }

            const utilityName = outputs.utility_name || outputs.utility || "Unknown Utility";

            return {
                success: true,
                data: {
                    utilityName,
                    residentialRate: outputs.residential,
                    commercialRate: outputs.commercial,
                    industrialRate: outputs.industrial,
                    companyId: outputs.company_id
                }
            };
        } catch (error: any) {
            lastError = error;
            console.error(`[ScrapeService] Utility Attempt ${attempt} failed:`, error.message || error);
            if (attempt < maxRetries) {
                const delay = 1000 * attempt;
                console.log(`[ScrapeService] Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }

    return { 
        success: false, 
        error: lastError?.name === 'TimeoutError' ? "NREL API timed out" : (lastError?.message || "Fetch failed after multiple attempts") 
    };
}
