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
  onSaveDraft?: () => void
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
  onSaveDraft,
}: FormButtonsProps) {
  const displayLabel = nextLabel ?? (isLastStep ? "Submit" : "Next")

  return (
    <div className="flex gap-2 sm:gap-4 justify-center items-center sm:mt-8">
      <div className="flex gap-2 sm:gap-3 items-center justify-center">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isLoading || saveStatus === "saving"}
            className="flex px-3 sm:px-8 border-primary text-primary hover:bg-primary/5 sm:min-w-[140px] h-9 sm:h-10 items-center justify-center gap-2"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span className="text-[10px] sm:text-xs">Saving...</span>
              </>
            ) : saveStatus === "saved" && lastSaved ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-[10px] sm:text-xs">Saved {getRelativeTime(lastSaved)}</span>
              </>
            ) : (
              <span className="text-[10px] sm:text-xs">Save Draft</span>
            )}
          </Button>
        )}

        {/* Submit/Next button */}
        <Button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="px-8 sm:px-12 bg-primary text-primary-foreground hover:bg-primary/90 sm:min-w-[180px] shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1.5" />
              <span className="text-xs sm:text-sm">...</span>
            </>
          ) : (
            <span className="text-sm">{displayLabel}</span>
          )}
        </Button>
      </div>
    </div>
  )
}
