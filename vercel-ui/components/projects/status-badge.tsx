import type { ProjectStatus } from "@/types/project"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig: Record<ProjectStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  draft: {
    label: "Draft",
    variant: "secondary",
    className: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
  },
  pending: {
    label: "Pending",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
  },
  in_review: {
    label: "In Review",
    variant: "outline",
    className: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
  },
  approved: {
    label: "Approved",
    variant: "default",
    className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
  }
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} font-medium ${className}`}
    >
      {config.label}
    </Badge>
  )
}
