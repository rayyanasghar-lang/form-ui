export interface Subtask {
  id: number
  name: string
  stage: string
  is_closed: boolean
  deadline: string | null
  priority: string
  description: boolean
}

export interface ChatLog {
  id: number
  date: string
  author: string
  body: string
  type: string
  subtype: string
  tracking: Array<{
    field: string
    label: string
    old_value: string
    new_value: string
    description: string
  }>
}

export interface ProjectUpdateData {
  project_id: string
  project_name: string
  status: string
  odoo_stage: string
  subtasks: Subtask[]
  subtasks_summary: string
  chat_logs: ChatLog[]
  completion_percentage: number
}

export interface ProjectUpdateResponse {
  status: string
  data: ProjectUpdateData
}
