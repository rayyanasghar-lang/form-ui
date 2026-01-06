import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Loader2, X, FileText , Loader} from "lucide-react"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "done" | "in-process" | "rejected" | "draft"
  label: string
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, label, className, ...props }, ref) => {
    const getIconColor = () => {
      switch (status) {
        case "done":
          return "text-emerald-600"
        case "rejected":
          return "text-red-600"
        case "in-process":
          return "text-[oklch(68.351%_0.19585_34.956)]"
        case "draft":
          return "text-zinc-500"
        default:
          return "text-zinc-400"
      }
    }

    const iconColor = getIconColor()

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-0 py-1 bg-transparent",
          className,
        )}
        {...props}
      >
        {status === "done" && <Check className={cn("h-4 w-4", iconColor)} strokeWidth={2.5} />}
        {status === "in-process" && <Loader className={cn("h-4 w-4 ", iconColor)} />}
        {status === "rejected" && <X className={cn("h-4 w-4", iconColor)} strokeWidth={2.5} />}
        {status === "draft" && <FileText className={cn("h-4 w-4", iconColor)} />}
        <span className={cn("text-sm font-medium", iconColor)}>{label}</span>
      </div>
    )
  },
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
