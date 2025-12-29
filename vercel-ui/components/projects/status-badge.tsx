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
          return "text-white"
        case "rejected":
          return "text-white"
        case "in-process":
          return "text-[oklch(68.351%_0.19585_34.956)]"
        case "draft":
          return "text-yellow-500"
        default:
          return "text-gray-400"
      }
    }

    const iconColor = getIconColor()

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
          className,
        )}
        {...props}
      >
        {status === "done" && <Check className={cn("h-4 w-4 border border-white bg-green-500 rounded-full", iconColor)} strokeWidth={3} />}
        {status === "in-process" && <Loader className={cn("h-4 w-4 ", iconColor)} />}
        {status === "rejected" && <X className={cn("h-4 w-4 border border-white bg-red-500 rounded-full", iconColor)} strokeWidth={3} />}
        {status === "draft" && <FileText className={cn("h-4 w-4 ", iconColor)} />}
        <span className="text-sm  text-gray-600 dark:text-gray-400 font-medium">{label}</span>
      </div>
    )
  },
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
