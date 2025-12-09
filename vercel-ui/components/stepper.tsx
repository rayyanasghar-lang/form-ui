"use client"

import { cn } from "@/lib/utils"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const progress = ((currentStep) / (steps.length - 1)) * 100

  return (
    <div className="mb-8 w-full">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "text-sm font-medium transition-all duration-300",
              index <= currentStep ? "text-white" : "text-white/60"
            )}
          >
            <span className={cn(
              "inline-flex items-center gap-2",
              index === currentStep && "text-white font-semibold"
            )}>
              <span className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300",
                index < currentStep 
                  ? "bg-primary text-primary-foreground scale-100" 
                  : index === currentStep 
                    ? "bg-primary/20 text-white ring-2 ring-primary/40 scale-110 animate-bounce-subtle"
                    : "bg-white/10 text-white/60 scale-90"
              )}>
                {index < currentStep ? (
                  <span className="animate-scale-in">✓</span>
                ) : (
                  <span className={cn(
                    index === currentStep && "animate-scale-in"
                  )}>
                    {index + 1}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar track */}
      <div className="relative w-full h-2.5 bg-muted border border-border rounded-full overflow-hidden">
        {/* Animated progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out shadow-sm shadow-primary/30"
          style={{ width: `${progress}%` }}
        />
        {/* Subtle glow effect on progress */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary rounded-full blur-sm transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current step indicator text */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  )
}
