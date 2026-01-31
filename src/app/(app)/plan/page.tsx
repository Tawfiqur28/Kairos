'use client';

import { generatePersonalizedActionPlan } from '@/ai/flows/generate-personalized-action-plan';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { Ikigai } from '@/lib/types';
import careerData from '@/lib/careers.json';
import { Loader2, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

function PlanGenerator() {
  const searchParams = useSearchParams();
  const careerId = searchParams.get('career');
  const career = careerData.careers.find((c) => c.id === careerId);

  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  });

  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    if (!career) {
      toast({
        title: 'No Career Selected',
        description: 'Please select a career from the careers page first.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setActionPlan(null);
    try {
      const userDetails = `The user is an undergraduate student. Their profile is as follows - Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}.`;
      
      const result = await generatePersonalizedActionPlan({
        careerGoal: career.title,
        userDetails: userDetails,
      });

      setActionPlan(result.actionPlan);
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: 'Could not generate an action plan at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically generate plan on page load if a career is selected
    if (career) {
      handleGeneratePlan();
    }
  }, [career]);


  if (!career) {
    return (
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Career Selected</AlertTitle>
            <AlertDescription>
                Please go to the "Careers" page and get an AI match to generate a plan.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Action Plan: {career.title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-headline">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">AI is crafting your personalized plan...</p>
          </div>
        )}
        {actionPlan && <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">{actionPlan}</div>}
        {!actionPlan && !isLoading && (
            <div className="text-center p-8">
                <p className="mb-4">Click the button to generate your personalized action plan.</p>
                <Button onClick={handleGeneratePlan} disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function PlanPage() {
    return (
        <>
        <PageHeader
            title="Your Action Plan"
            description="A personalized, step-by-step guide to help you achieve your career goals."
        />
        <Suspense fallback={<div>Loading...</div>}>
            <PlanGenerator />
        </Suspense>
        </>
    )
}
