import type { ReactNode } from "react";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

type Step = {
  title: string;
  content: ReactNode;
};

type TitleBarStepperProps = {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
};

export function TitleBarStepper({
  steps,
  currentStep,
  onStepChange,
  className,
}: TitleBarStepperProps) {
  return (
    <Stepper
      value={currentStep}
      onValueChange={onStepChange}
      className={className}
    >
      <StepperNav className="mb-8 gap-3.5">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
          >
            <StepperTrigger className="flex grow flex-col items-start justify-center gap-3.5">
              <StepperIndicator className="h-1 w-full rounded-full bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary" />
              <div className="flex flex-col items-start gap-1">
                <StepperTitle className="text-start font-semibold group-data-[state=inactive]/step:text-muted-foreground">
                  {step.title}
                </StepperTitle>
              </div>
            </StepperTrigger>
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel>
        {steps.map((step, index) => (
          <StepperContent key={index} value={index + 1}>
            {step.content}
          </StepperContent>
        ))}
      </StepperPanel>
    </Stepper>
  );
}
