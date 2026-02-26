export type EquipmentCategory = "electrical" | "structural" | "other"

export type EquipmentType = 
  | "solar" 
  | "inverter" 
  | "optimizer" 
  | "disconnect" 
  | "battery" 
  | "attachment" 
  | "racking-roof" 
  | "racking-ground" 
  | "racking-subcomponent" 
  | "racking-system"
  | "services" 
  | "ashrae" 
  | "jurisdictions" 
  | "suppliers" 
  | "manufacturers" 
  | "ahi" 
  | "utilities"

export interface EquipmentRecord {
  id: string
  uuid: string
  make_model?: string
  model?: string
  brand_name?: string
  categorizedSpecs?: {
    category: string
    specs: {
      name: string
      key: string
      value: string
    }[]
  }[]
  categorized_specs?: {
    category: string
    specs: {
      name: string
      key: string
      value: string
    }[]
  }[]
  [key: string]: any
}

export interface EquipmentTypeConfig {
  id: EquipmentType
  label: string
  icon: any
  category: EquipmentCategory
  apiPath?: string
  hasChildren?: boolean
  parentId?: string
}
