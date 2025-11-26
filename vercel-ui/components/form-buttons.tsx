"use client"

import { Button } from "@/components/ui/button"

interface FormButtonsProps {
  onNext: () => void
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  nextLabel?: string
  backLabel?: string
  isLoading?: boolean
}

export default function FormButtons({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  nextLabel = isLastStep ? "Submit" : "Next",
  backLabel = "Back",
  isLoading = false,
}: FormButtonsProps) {
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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled
          className="px-8 opacity-50"
        >
          Save as draft
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="px-8 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Loading..." : nextLabel}
        </Button>
      </div>
    </div>
  )
}
