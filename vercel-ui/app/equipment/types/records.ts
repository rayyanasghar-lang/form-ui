export interface SolarRecord {
  id: string
  uuid: string
  model: string
  brand_name?: string
  brandName?: string
  manufacturer?: string
  power?: number
  efficiency?: number
  openCircuitVoltage?: number
  enabled?: boolean
  [key: string]: any
}

export interface InverterRecord {
  id: string
  uuid: string
  model: string
  manufacturer?: string
  brandName?: string
  brand_name?: string
  inverterType?: "string" | "micro"
  maxDCPower?: number
  ACOutputPower?: number
  efficiency?: number
  enabled?: boolean
  [key: string]: any
}

export interface BatteryRecord {
  id: string
  uuid: string
  modelName: string
  model?: string
  manufacturer?: string
  brandName?: string
  brand_name?: string
  usableEnergy?: string
  ratedOutputPower?: string
  peakPower?: string
  price?: number
  enabled?: boolean
  [key: string]: any
}

export interface RackingRecord {
  id: string
  uuid: string
  name?: string
  manufacturer?: string
  rackingType?: "roof" | "ground"
  racking_type?: string
  rackingModel?: string
  model?: string
  racking_system_name?: string
  componentType?: string
  description?: string
  enabled?: boolean
  [key: string]: any
}

export interface GeneralRecord {
  id: string
  uuid: string
  name?: string
  model?: string
  brandName?: string
  brand_name?: string
  manufacturer?: string
  enabled?: boolean
  [key: string]: any
}
