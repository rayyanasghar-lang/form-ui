"use client"

import { cn } from "@/lib/utils"
import { ProjectStatus } from "@/types/project"

interface Stage {
  id: ProjectStatus
  label: string
}

const STAGES: Stage[] = [
  { id: "New Job Creation", label: "New Job Creation" },
  { id: "New Design", label: "New Design" },
  { id: "Design internal review", label: "Design-Internal Review" },
  { id: "Design revision", label: "Design Revision" },
  { id: "Awaiting Engineering", label: "Awaiting Engineering" },
  { id: "Print and Ship", label: "Print & Ship" },
  { id: "Design submitted", label: "Design Submitted" },
  { id: "On hold/challenge", label: "On Hold / Challenged" },
]

interface ProjectStatusBarProps {
  currentStatus: ProjectStatus
  className?: string
}

export function ProjectStatusBar({ currentStatus, className }: ProjectStatusBarProps) {
  // Find index of current status
  const activeIndex = STAGES.findIndex((s) => s.id === currentStatus)

  return (
    <div className={cn("w-full overflow-x-auto no-scrollbar py-2", className)}>
      <div className="flex items-center w-full px-2">
        {STAGES.map((stage, index) => {
          const isActive = stage.id === currentStatus
          const isPast = activeIndex > index
          
          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex flex-1 items-center justify-center h-9 px-1 lg:px-2 transition-all duration-200",
                "first:rounded-l-md last:rounded-r-md",
                isActive 
                  ? "bg-primary/10 text-primary font-black border-y border-primary/30 z-20" 
                  : isPast
                    ? "bg-zinc-50 text-zinc-500 border-y border-zinc-200"
                    : "bg-zinc-100/40 text-zinc-400 border-y border-zinc-100"
              )}
              style={{
                clipPath: index === 0 
                  ? "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)"
                  : index === STAGES.length - 1
                    ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)"
                    : "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)",
                marginLeft: index === 0 ? 0 : "-8px",
                zIndex: STAGES.length - index
              }}
            >
              {/* Connector shadow/border effect */}
              {index > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20 hidden" />
              )}
              
              <span className="text-[11px] lg:text-xs whitespace-nowrap uppercase tracking-wider">
                {stage.label}
              </span>
              
              {isActive && (
                <span className="ml-2 py-0.5 px-1 bg-primary/20 rounded text-[9px] font-medium opacity-60">
                   {/* Duration placeholder if we had it: 4d */}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
