import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description?: string;
}

interface MultiStepFormProps {
  title: string;
  steps: Step[];
  children: (step: number, next: () => void, prev: () => void) => ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
  backPath?: string;
}

export default function MultiStepForm({ title, steps, children, onSubmit, isSubmitting, backPath = '/register' }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onSubmit();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex h-14 items-center">
          <Link to={backPath} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">CYLO</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-3xl py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>

        {/* Step indicator */}
        <div className="mt-6 flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < currentStep && "bg-success text-success-foreground",
                i === currentStep && "bg-primary text-primary-foreground",
                i > currentStep && "bg-muted text-muted-foreground"
              )}>
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-sm sm:block", i === currentStep ? "font-medium text-foreground" : "text-muted-foreground")}>
                {step.title}
              </span>
              {i < steps.length - 1 && <div className="h-px w-6 bg-border sm:w-12" />}
            </div>
          ))}
        </div>

        <Card className="mt-8 shadow-card">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-foreground">{steps[currentStep].title}</h2>
            {steps[currentStep].description && (
              <p className="mt-1 text-sm text-muted-foreground">{steps[currentStep].description}</p>
            )}
            <div className="mt-6">
              {children(currentStep, next, prev)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
