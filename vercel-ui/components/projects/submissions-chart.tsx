"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ChartDataPoint } from "@/types/project"

interface SubmissionsChartProps {
  data: ChartDataPoint[]
  className?: string
}

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "var(--primary)",
  },
  approvals: {
    label: "Approvals", 
    color: "var(--success)",
  },
} satisfies ChartConfig

type TimeRange = "30d" | "90d" | "1yr"

export function SubmissionsChart({ data, className }: SubmissionsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  return (
    <Card className={`bg-card border-border shadow-lg ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-zinc-900">
            Project Submissions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of submissions over time
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["30d", "90d", "1yr"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`h-8 px-3 text-xs font-medium ${
                timeRange === range 
                  ? "bg-background shadow-sm text-zinc-900" 
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-background/50"
              }`}
            >
              {range === "30d" ? "30 days" : range === "90d" ? "90 days" : "1 year"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border)" 
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-card border-border"
                  indicator="dot"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="submissions"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#submissionsGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
