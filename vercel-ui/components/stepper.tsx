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
              "text-sm font-extrabold transition-all duration-300",
              index <= currentStep ? "text-foreground" : "text-foreground/40"
            )}
          >
            <span className={cn(
              "inline-flex items-center gap-2",
              index === currentStep && "text-primary font-bold"
            )}>
              <span className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 shadow-sm",
                index < currentStep 
                  ? "bg-secondary text-secondary-foreground scale-100" 
                  : index === currentStep 
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 animate-bounce-subtle"
                    : "bg-muted text-muted-foreground scale-90"
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
      <div className="relative w-full h-3 bg-secondary border border-border rounded-full overflow-hidden">
        {/* Animated progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current step indicator text */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs font-bold text-foreground/60">
          Step {currentStep + 1} of {steps.length}
        </p>
        <p className="text-xs font-bold text-foreground/60">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  )
}
