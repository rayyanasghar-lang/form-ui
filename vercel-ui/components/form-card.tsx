import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FormCardProps {
  title: string
  description?: string
  children: ReactNode
}

export default function FormCard({ title, description, children }: FormCardProps) {
  return (
    <Card className="relative bg-card/30 backdrop-blur-3xl border border-white/10 transition-all duration-700 shadow-2xl animate-fade-in-up overflow-hidden rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
