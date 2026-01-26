"use server"

/**
 * Weather Service
 * 
 * Fetches nearby weather stations from the National Weather Service (NWS) API.
 */

export interface WeatherStation {
    id: string;
    name: string;
    distance: number;
    timeZone: string;
}

/**
 * Fetch nearby weather stations based on latitude and longitude
 */
export async function fetchNearbyStations(lat: number, lng: number): Promise<{ success: boolean; data?: WeatherStation[]; error?: string }> {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            console.log(`[WeatherService] Fetching stations for: ${lat}, ${lng} (Attempt ${attempt + 1})`);
            
            const url = `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}/stations`;
            
            const response = await fetch(url, {
                headers: {
                    // NWS API requires a User-Agent
                    "User-Agent": "(solar-planset-app, contact@example.com)",
                    "Accept": "application/geo+json"
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[WeatherService] NWS API Error (Attempt ${attempt + 1}): ${response.status}`, errorText);
                
                // If it's a 4xx error (except 429), don't retry
                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    return { success: false, error: `NWS API Error: ${response.status}` };
                }
            } else {
                const data = await response.json();
                
                if (!data.features || !Array.isArray(data.features)) {
                    return { success: true, data: [] };
                }

                // Map and limit to 5-6 stations
                const stations: WeatherStation[] = data.features.slice(0, 9).map((feature: any) => ({
                    id: feature.properties.stationIdentifier,
                    name: feature.properties.name,
                    distance: feature.properties.distance.value, // distance in meters
                    timeZone: feature.properties.timeZone
                }));

                return { success: true, data: stations };
            }
        } catch (error: any) {
            console.error(`[WeatherService] Fetch Error (Attempt ${attempt + 1}):`, error);
            
            // If it's the last attempt, return failure
            if (attempt === maxRetries - 1) {
                const isDnsError = error.code === 'EAI_AGAIN' || error.message?.includes('EAI_AGAIN');
                const errorMsg = isDnsError ? "DNS failure (api.weather.gov). Connectivity issue in environment." : error.message;
                return { success: false, error: errorMsg };
            }
        }

        attempt++;
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return { success: false, error: "Failed to fetch weather stations after maximum retries." };
}

/**
 * Geocode address to lat/lng using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<{ success: boolean; lat?: number; lng?: number; state?: string; error?: string }> {
    try {
        const apiKey = process.env.SOLAR_API;
        if (!apiKey) {
            return { success: false, error: "Geocoding API key missing (SOLAR_API)" };
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.results.length) {
            return { success: false, error: data.error_message || "Address not found" };
        }

        const { lat, lng } = data.results[0].geometry.location;
        
        // Extract state short name (e.g., "CO")
        let state = "";
        const addressComponents = data.results[0].address_components;
        if (addressComponents) {
            const stateComp = addressComponents.find((c: any) => c.types.includes("administrative_area_level_1"));
            if (stateComp) {
                state = stateComp.short_name;
            }
        }

        return { success: true, lat, lng, state };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Reverse Geocode lat/lng to address using Google Maps Geocoding API
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
        const apiKey = process.env.SOLAR_API;
        if (!apiKey) {
            return { success: false, error: "Geocoding API key missing (SOLAR_API)" };
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.results.length) {
            return { success: false, error: data.error_message || "Address not found for these coordinates" };
        }

        // Return the first formatted address
        const address = data.results[0].formatted_address;
        return { success: true, address };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
