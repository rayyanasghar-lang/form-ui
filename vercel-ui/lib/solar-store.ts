/**
 * Solar Data Store
 * 
 * A simple utility to store and retrieve solar data between pages.
 * Uses localStorage for persistence.
 */

const STORAGE_KEY = "solar-analysis-data";

export interface SolarData {
  address: string;
  lat: number;
  lng: number;
  solar: any;
  layers: any;
  timestamp: number;
}

/**
 * Save solar data to localStorage
 */
export function saveSolarData(data: Omit<SolarData, "timestamp">): void {
  const storedData: SolarData = {
    ...data,
    timestamp: Date.now(),
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent("solar-data-updated", { detail: storedData }));
  }
}

/**
 * Get solar data from localStorage
 */
export function getSolarData(): SolarData | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as SolarData;
  } catch {
    return null;
  }
}

/**
 * Clear solar data from localStorage
 */
export function clearSolarData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if solar data exists and is recent (within 1 hour)
 */
export function hasFreshSolarData(): boolean {
  const data = getSolarData();
  if (!data) return false;
  
  const oneHour = 60 * 60 * 1000;
  return Date.now() - data.timestamp < oneHour;
}
