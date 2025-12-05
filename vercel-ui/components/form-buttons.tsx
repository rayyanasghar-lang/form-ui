"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Check, Cloud } from "lucide-react"

interface FormButtonsProps {
  onNext: () => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  nextLabel?: string
  backLabel?: string
  isLoading?: boolean
  saveStatus?: "saving" | "saved" | "idle"
  lastSaved?: Date | null
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)

  if (diffSecs < 10) return "just now"
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins} min ago`
  return `${diffHours}h ago`
}

export default function FormButtons({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  nextLabel,
  backLabel = "Back",
  isLoading = false,
  saveStatus = "idle",
  lastSaved = null,
}: FormButtonsProps) {
  const displayLabel = nextLabel ?? (isLastStep ? "Submit" : "Next")

  return (
    <div className="flex gap-4 justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        className="px-8 bg-transparent"
      >
        {backLabel}
      </Button>

      <div className="flex gap-3 items-center">
        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveStatus === "saved" && lastSaved ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span>Saved {getRelativeTime(lastSaved)}</span>
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4" />
              <span>Auto-saved</span>
            </>
          )}
        </div>

        {/* Submit/Next button */}
        <Button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="px-8 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            displayLabel
          )}
        </Button>
      </div>
    </div>
  )
}
