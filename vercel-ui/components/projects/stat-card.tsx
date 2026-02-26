"use client"

import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon: LucideIcon
  accentColor?: string
}

  export function StatCard({
  title,
  value,
  trend,
  trendLabel = "vs last month",
  icon: Icon,
  accentColor = "var(--primary)"
}: StatCardProps) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <Card className="relative overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Decorative blob */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-15"
        style={{ backgroundColor: accentColor }}
      />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in oklch, ${accentColor} 15%, transparent)` }}
          >
            <Icon 
              className="h-6 w-6" 
              style={{ color: accentColor }}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-zinc-900 tracking-tight">
            {value}
          </p>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-zinc-500'
            }`}>
              {isPositive && <TrendingUp className="h-4 w-4" />}
              {isNegative && <TrendingDown className="h-4 w-4" />}
              <span>{isPositive ? '+' : ''}{trend}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
