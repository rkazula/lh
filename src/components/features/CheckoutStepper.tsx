import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepperProps {
  steps: string[];
  currentStep: number;
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8 relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10" />
        <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -z-10" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
                <div key={step} className="flex flex-col items-center gap-2 bg-background px-2">
                    <div 
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300",
                            isCompleted ? "bg-primary border-primary text-primary-foreground" :
                            isActive ? "bg-background border-primary text-primary scale-110" :
                            "bg-background border-muted text-muted-foreground"
                        )}
                    >
                        {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className={cn(
                        "text-xs font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {step}
                    </span>
                </div>
            );
        })}
    </div>
  );
}