import { InputType, QuestionOption } from "./site-centric"

export interface Category {
  id: string | number
  name: string
  sequence: number
}

export interface AdminQuestion {
  id: string | number
  key: string
  label: string
  inputType: InputType
  category: string | Category
  priority: number
  isCommon: boolean
  targetModel?: string
  targetField?: string
  options?: QuestionOption[]
  active: boolean
}

export interface AdminService {
  id: string | number
  name: string
  price: number
  description?: string
  questionIds?: (string | number)[]
  active: boolean
}

export interface MappingRule {
  ruleId: string | number
  questionId: string | number
  questionKey: string
  label: string
  orderIndex: number
  isRequired: boolean
  condition?: Record<string, any> | string
}
