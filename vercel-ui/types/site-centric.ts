export type InputType = "char" | "number" | "select" | "boolean" | "file" | "text" | "equipment_search" | "multi_select"

export interface Service {
  id: number | string
  name: string
  icon?: string
  description?: string
  questionCount?: number
}

export interface QuestionOption {
  id: number | string
  label: string
  value: string
  image?: string
}

export interface Question {
  id: number | string
  key: string
  label: string
  inputType: InputType
  isRequired: boolean
  description?: string
  placeholder?: string
  options?: QuestionOption[]
  categoryId?: number | string
  categoryName?: string
  category?: {
    id: number | string;
    name: string;
    sequence: number;
  };
  targetModel?: string
  targetField?: string
  sequence: number
  priority?: number
  condition?: string
  subCategory?: string
  extraData?: Record<string, any>
}

export interface Site {
  id: string // UUID from backend
  name: string
  address: string
  projectType: "residential" | "commercial"
  createdAt?: string
  updatedAt?: string
  projectIds?: string[]
}

export interface Answer {
  id?: number | string
  siteId: string
  questionId: number | string
  questionKey: string
  value: any
  updatedAt?: string
}

export interface SiteFullData extends Site {
  answers: Record<string, any>
  roof?: RoofComponent
  electrical?: ElectricalComponent
}

export interface RoofComponent {
  id?: number | string
  siteId: string
  material?: string
  pitch?: string
  condition?: string
  [key: string]: any
}

export interface ElectricalComponent {
  id?: number | string
  siteId: string
  mainPanelSize?: string
  interconnectionMethod?: string
  utilityCompany?: string
  [key: string]: any
}

export interface ApiResponse<T> {
  status: "success" | "error"
  data?: T
  message?: string
}
