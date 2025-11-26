import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "bg-accent text-accent-foreground border-2 border-primary"
                      : "bg-muted text-muted-foreground border-2 border-border",
                )}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  "ml-3 font-medium text-sm",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn("h-0.5 flex-1 mx-2 transition-colors", index < currentStep ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
