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
    try {
        console.log(`[WeatherService] Fetching stations for: ${lat}, ${lng}`);
        
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
            console.error(`[WeatherService] NWS API Error: ${response.status}`, errorText);
            return { success: false, error: `NWS API Error: ${response.status}` };
        }

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
    } catch (error: any) {
        console.error(`[WeatherService] Fetch Error:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Geocode address to lat/lng using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<{ success: boolean; lat?: number; lng?: number; error?: string }> {
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
        return { success: true, lat, lng };
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
