import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FormCardProps {
  title: string
  description?: string
  children: ReactNode
}

export default function FormCard({ title, description, children }: FormCardProps) {
  return (
    <Card className="bg-card border-border animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
