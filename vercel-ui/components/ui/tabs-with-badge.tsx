"use client"

import type * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function TabsWithBadge({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs-with-badge" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TabsWithBadgeList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-with-badge-list"
      className={cn(
        "inline-flex h-auto w-fit items-center border-b border-border bg-transparent gap-0",
        className,
      )}
      {...props}
    />
  )
}

interface TabsWithBadgeTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  badge?: number | string
}

function TabsWithBadgeTrigger({ className, badge, children, ...props }: TabsWithBadgeTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-with-badge-trigger"
      className={cn(
        "text-muted-foreground data-[state=active]:text-zinc-900 data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 group",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {badge !== undefined && (
          <span className="hidden md:inline-flex text-xs font-bold px-2 py-0.5 rounded-full border transition-colors bg-secondary text-muted-foreground border-border group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary group-data-[state=active]:border-primary/20">
            {badge}
          </span>
        )}
      </span>
    </TabsPrimitive.Trigger>
  )
}

function TabsWithBadgeContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-with-badge-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { TabsWithBadge, TabsWithBadgeList, TabsWithBadgeTrigger, TabsWithBadgeContent }
