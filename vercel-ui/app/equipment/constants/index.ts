import { 
  Sun, Zap, Settings2, Power, Battery, Database, Layers, Package, 
  Wrench, Building2, CloudSun, Map, Factory, Bolt 
} from "lucide-react"
import type { EquipmentCategory, EquipmentTypeConfig } from "../types"

export const EQUIPMENT_CATEGORIES: { id: EquipmentCategory; label: string }[] = [
  { id: "electrical", label: "ELECTRICAL" },
  { id: "structural", label: "STRUCTURAL" },
  { id: "other", label: "OTHER" },
]

export const EQUIPMENT_TYPES: EquipmentTypeConfig[] = [
  // ELECTRICAL
  { id: "solar", label: "Solar Panels", icon: Sun, category: "electrical", apiPath: "solar" },
  { id: "inverter", label: "Inverters", icon: Zap, category: "electrical", apiPath: "inverter" },
  { id: "optimizer", label: "DC Optimizers", icon: Settings2, category: "electrical", apiPath: "optimizer" },
  { id: "disconnect", label: "Disconnects", icon: Power, category: "electrical", apiPath: "disconnect" },
  { id: "battery", label: "Batteries", icon: Battery, category: "electrical", apiPath: "battery" },
  
  // STRUCTURAL
  { id: "racking-system", label: "Racking Systems (Hub)", icon: Database, category: "structural", apiPath: "racking-system" },
  { id: "racking-roof", label: "Roof Mount Products", icon: Layers, category: "structural", apiPath: "racking-roof" },
  { id: "racking-ground", label: "Ground Mount Products", icon: Package, category: "structural", apiPath: "racking-ground" },
  { id: "racking-subcomponent", label: "Racking Sub-Components", icon: Settings2, category: "structural", apiPath: "subcomponent" },
  { id: "attachment", label: "Equipment Attachments", icon: Wrench, category: "structural", apiPath: "attachment" },
  
  // OTHER
  { id: "services", label: "Services", icon: Building2, category: "other" },
  { id: "ashrae", label: "ASHRAE Data", icon: CloudSun, category: "other" },
  { id: "jurisdictions", label: "Jurisdictions", icon: Map, category: "other" },
  { id: "suppliers", label: "Suppliers", icon: Factory, category: "other" },
  { id: "manufacturers", label: "Manufacturers", icon: Factory, category: "other" },
  { id: "ahi", label: "AHI", icon: Bolt, category: "other" },
  { id: "utilities", label: "Utilities", icon: Zap, category: "other" },
]

export const SUBCOMPONENT_TYPES = [
  { key: "splices", label: "Splices" },
  { key: "end_clamp", label: "End Clamp" },
  { key: "mid_clamp", label: "Mid Clamp" },
  { key: "end_cap", label: "End Cap" },
  { key: "wire_clip", label: "Wire Clip" },
  { key: "grounding_lug", label: "Grounding Lug" },
  { key: "grounding_lugs", label: "Grounding Lugs" },
  { key: "bonding_hardware", label: "Bonding Hardware" },
]

export const RACKING_MANUFACTURERS = [
  { key: "UNIRAC", label: "UNIRAC" },
  { key: "IRONRIDGE", label: "IRONRIDGE" },
  { key: "K2-SYSTEM", label: "K2-SYSTEM" },
]
