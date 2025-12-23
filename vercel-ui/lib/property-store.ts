/**
 * Property Data Store
 * 
 * Stores scraped property data (Zillow, ASCE) between components.
 */

const STORAGE_KEY = "property-scrape-data";

export interface SourceData {
  regrid?: {
    parcelNumber: string | null;
    owner: string | null;
    lotSize: string | null;
    landUse: string | null;
  };
  zillow?: {
    parcelNumber: string | null;
    lotSize: string | null;
    interiorArea?: string | null;
    structureArea?: string | null;
    newConstruction?: boolean | null;
    yearBuilt?: string | null;
  };
  asce?: {
    windSpeed: string | null;
    snowLoad: string | null;
  };
}

export interface PropertyData {
  address: string;
  lotSize: string | null;
  parcelNumber: string | null;
  owner?: string | null;
  landUse?: string | null;
  windSpeed: string | null;
  snowLoad: string | null;
  interiorArea?: string | null;
  structureArea?: string | null;
  newConstruction?: boolean | null;
  yearBuilt?: string | null;
  sources?: SourceData;
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
 * Update partial property data in localStorage
 */
export function updatePropertyData(partialData: Partial<Omit<PropertyData, "timestamp" | "address" | "sources">> & { sources?: Partial<SourceData> }): void {
  if (typeof window === "undefined") return;
  
  const existing = getPropertyData();
  if (!existing) return;

  const updatedData: PropertyData = {
    ...existing,
    ...partialData,
    sources: {
      ...existing.sources,
      ...partialData.sources,
    },
    timestamp: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  window.dispatchEvent(new CustomEvent("property-data-updated", { detail: updatedData }));
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
