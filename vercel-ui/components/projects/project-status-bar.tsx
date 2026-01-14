import { cn } from "@/lib/utils"
import { ProjectStatus } from "@/types/project"
import { 
  FilePlus, 
  PenTool, 
  Search, 
  RefreshCw, 
  Aperture, 
  Printer, 
  Send, 
  PauseCircle,
  LucideIcon
} from "lucide-react"

interface Stage {
  id: ProjectStatus
  label: string
  icon: LucideIcon
}

const STAGES: Stage[] = [
  { id: "New Job Creation", label: "New Job Creation", icon: FilePlus },
  { id: "New Design", label: "New Design", icon: PenTool },
  { id: "Design internal review", label: "Design-Internal Review", icon: Search },
  { id: "Design revision", label: "Design Revision", icon: RefreshCw },
  { id: "Awaiting Engineering", label: "Awaiting Engineering", icon: Aperture },
  { id: "Print and Ship", label: "Print & Ship", icon: Printer },
  { id: "Design submitted", label: "Design Submitted", icon: Send },
  { id: "On hold/challenge", label: "On Hold / Challenged", icon: PauseCircle },
]

interface ProjectStatusBarProps {
  currentStatus: ProjectStatus
  className?: string
}

export function ProjectStatusBar({ currentStatus, className }: ProjectStatusBarProps) {
  // Find index of current status
  const activeIndex = STAGES.findIndex((s) => s.id === currentStatus)
  const currentStage = STAGES[activeIndex] || STAGES[0]

  return (
    <div className={cn("w-full py-2", className)}>
      {/* Mobile View: Single Active Status Badge */}
      <div className="flex md:hidden items-center justify-center w-full px-4">
        <div className="flex items-center gap-3 bg-primary/10 text-primary border border-primary/30 py-3 px-6 rounded-2xl w-full shadow-sm">
          <div className="p-2 bg-primary/20 rounded-xl">
            <currentStage.icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Current Status</span>
            <span className="text-sm font-black uppercase tracking-wider">{currentStage.label}</span>
          </div>
        </div>
      </div>

      {/* Desktop View: Full Chevron Bar */}
      <div className="hidden md:flex items-center w-full px-2 overflow-x-auto no-scrollbar">
        {STAGES.map((stage, index) => {
          const isActive = stage.id === currentStatus
          const isPast = activeIndex > index
          const Icon = stage.icon
          
          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex flex-1 items-center justify-center font-extrabold h-11 px-3 lg:px-4 transition-all duration-300",
                "first:rounded-l-xl last:rounded-r-xl group",
                isActive 
                  ? "bg-primary text-primary-foreground font-black z-20 shadow-lg shadow-primary/20" 
                  : isPast
                    ? "bg-zinc-100 text-zinc-500 border-y border-zinc-200"
                    : "bg-zinc-50/50 text-zinc-400 border-y border-zinc-100"
              )}
              style={{
                clipPath: index === 0 
                  ? "polygon(0% 0%, 93% 0%, 100% 50%, 93% 100%, 0% 100%)"
                  : index === STAGES.length - 1
                    ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 7% 50%)"
                    : "polygon(0% 0%, 93% 0%, 100% 50%, 93% 100%, 0% 100%, 7% 50%)",
                marginLeft: index === 0 ? 0 : "-12px",
                zIndex: isActive ? 30 : STAGES.length - index
              }}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-white" : "text-current opacity-40 group-hover:opacity-70 transition-opacity"
                )} />
                <span className="text-[10px] lg:text-[11px] whitespace-nowrap uppercase tracking-widest">
                  {stage.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
