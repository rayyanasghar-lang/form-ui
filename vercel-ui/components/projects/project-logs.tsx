"use client"

import { cn } from "@/lib/utils"

interface ChatLog {
  id: string | number
  date: string
  author: string | any[]
  body?: string
  subtype?: string
  tracking?: { description: string }[]
}

interface ProjectLogsProps {
  logs: ChatLog[]
  className?: string
}

export function ProjectLogs({ logs, className }: ProjectLogsProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-6", className)}>
        <div className="text-center text-zinc-400">
          <p className="font-medium text-sm">No logs available</p>
          <p className="text-xs mt-1">Project activity will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      <div className="relative pl-6 border-l-2 border-zinc-100 space-y-6 pb-4 ml-1">
        {logs.map((log) => {
          // Parse author
          let author = "Unknown"
          const authorRaw = log.author
          if (typeof authorRaw === 'string') {
            author = authorRaw
          } else if (Array.isArray(authorRaw) && authorRaw.length > 1) {
            author = String(authorRaw[1])
          } else if (authorRaw && typeof authorRaw === 'object') {
            author = String((authorRaw as any).name || (authorRaw as any).display_name || "Unknown")
          }

          return (
            <div key={log.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-zinc-300 group-hover:bg-primary transition-colors shadow-sm ring-2 ring-white" />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                    {new Date(log.date).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider truncate max-w-[100px]">
                    {author}
                  </span>
                </div>
                
                <p className="text-xs font-medium text-zinc-900 leading-snug">
                  {log.subtype === "Stage Changed" 
                    ? log.tracking?.[0]?.description || log.body 
                    : log.body || log.subtype}
                </p>
                
                {log.tracking && log.tracking.length > 0 && log.subtype !== "Stage Changed" && (
                  <div className="mt-1.5 space-y-1">
                    {log.tracking.map((track, i) => (
                      <p key={i} className="text-[10px] text-zinc-500 italic bg-zinc-50/50 p-1.5 rounded border border-zinc-100/50">
                        {track.description}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
