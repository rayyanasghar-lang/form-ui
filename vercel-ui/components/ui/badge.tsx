import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 hover:bg-destructive/80",
        outline: 
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        selectable:
          "border-border bg-card/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]",
        selected:
          "border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20 ring-1 ring-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
