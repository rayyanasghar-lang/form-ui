/**
 * Property Data Store
 * 
 * Stores scraped property data (Zillow, ASCE) between components.
 */

const STORAGE_KEY = "property-scrape-data";

export interface PropertyData {
  address: string;
  lotSize: string | null;
  parcelNumber: string | null;
  windSpeed: string | null;
  snowLoad: string | null;
  timestamp: number;
}

/**
 * Save property data to localStorage
 */
export function savePropertyData(data: Omit<PropertyData, "timestamp">): void {
  const storedData: PropertyData = {
    ...data,
    timestamp: Date.now(),
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent("property-data-updated", { detail: storedData }));
  }
}

/**
 * Get property data from localStorage
 */
export function getPropertyData(): PropertyData | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as PropertyData;
  } catch {
    return null;
  }
}

/**
 * Clear property data from localStorage
 */
export function clearPropertyData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
