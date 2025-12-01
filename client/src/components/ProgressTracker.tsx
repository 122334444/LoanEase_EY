import { cn } from "@/lib/utils";
import { applicationSteps } from "@shared/schema";
import { Check, Circle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ProgressTrackerProps {
  currentStep: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function ProgressTracker({ 
  currentStep, 
  className,
  orientation = "vertical" 
}: ProgressTrackerProps) {
  const currentStepIndex = applicationSteps.findIndex(s => s.id === currentStep);

  return (
    <div 
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-1" : "flex-row gap-2 overflow-x-auto",
        className
      )}
      data-testid="progress-tracker"
    >
      {applicationSteps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isPending = index > currentStepIndex;

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-3",
              orientation === "horizontal" && "flex-col items-center min-w-[80px]"
            )}
            data-testid={`step-${step.id}`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  "border-2 transition-colors duration-200",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  isPending && "border-muted bg-muted/50 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </motion.div>

              {orientation === "vertical" && index < applicationSteps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-4 mt-8 w-0.5 h-6 -translate-x-1/2",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} 
                />
              )}
            </div>

            <div className={cn(
              "flex-1 pb-4",
              orientation === "horizontal" && "text-center pb-0"
            )}>
              <p className={cn(
                "text-sm font-medium leading-tight",
                isCurrent && "text-foreground",
                isCompleted && "text-foreground",
                isPending && "text-muted-foreground"
              )}>
                {step.label}
              </p>
              {orientation === "vertical" && (
                <p className={cn(
                  "text-xs mt-0.5",
                  isCurrent || isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"
                )}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
