"use client"

import { cn } from "@/lib/utils"

interface BackgroundGradientProps {
  className?: string
}

export function BackgroundGradient({ className }: BackgroundGradientProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none -z-50 overflow-hidden", className)}>
      {/* Top Right Blob - Primary (Indigo) */}
      <div 
        className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/8 blur-[120px] animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
      
      {/* Bottom Left Blob - Secondary/Primary Mix */}
      <div 
        className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px] animate-pulse" 
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />
      
      {/* Center Subtle Accent */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-primary/3 blur-[90px]" 
      />
    </div>
  )
}
