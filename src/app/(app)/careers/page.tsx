'use client';

import { generateCareerMatchExplanations } from '@/ai/flows/generate-career-match-explanations';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import careerData from '@/lib/careers.json';
import type { Career, Ikigai } from '@/lib/types';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type MatchResult = {
  explanation: string;
  fitScore: number;
};

export default function CareersPage() {
  const careers: Career[] = careerData.careers;
  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  });

  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isProfileComplete =
    ikigai.passions && ikigai.skills && ikigai.values && ikigai.interests;

  const handleCheckFit = async (career: Career) => {
    if (!isProfileComplete) {
      toast({
        title: 'Profile Incomplete',
        description: 'Please complete your Ikigai Canvas before checking for a career match.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedCareer(career);
    setIsLoading(true);
    setMatchResult(null);

    try {
      const userProfileString = `Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}.`;
      const careerDetailsString = `${career.description} Required skills: ${career.requiredSkills.join(', ')}.`;

      const result = await generateCareerMatchExplanations({
        userProfile: userProfileString,
        career: career.title,
        careerDetails: careerDetailsString,
      });

      setMatchResult(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: 'Could not generate a career match at this time.',
        variant: 'destructive',
      });
      // Close the dialog on error
      setSelectedCareer(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Career Explorer"
        description="Discover careers that align with your unique Ikigai profile."
      />

      {!hasMounted ? (
         <Card className="mb-6">
            <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardFooter>
                 <Skeleton className="h-10 w-40" />
            </CardFooter>
        </Card>
      ) : !isProfileComplete && (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
                <CardTitle className="text-yellow-900 dark:text-yellow-300">Complete Your Profile</CardTitle>
                <CardDescription className="text-yellow-800 dark:text-yellow-400">
                    Your Ikigai Canvas is empty. Please fill it out to enable AI career matching.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button variant="secondary" asChild>
                    <Link href="/ikigai">Go to Ikigai Canvas</Link>
                </Button>
            </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((career) => (
          <Card key={career.id}>
            <CardHeader>
              <CardTitle>{career.title}</CardTitle>
              <CardDescription>{career.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="text-sm font-semibold mb-2">Key Skills:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {career.requiredSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleCheckFit(career)} disabled={!hasMounted || !isProfileComplete}>
                <Sparkles className="mr-2 h-4 w-4" />
                Check Fit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedCareer} onOpenChange={(isOpen) => !isOpen && setSelectedCareer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI Career Match: {selectedCareer?.title}</DialogTitle>
            <DialogDescription>
              Here's how this career aligns with your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Our AI is analyzing your profile...</p>
              </div>
            )}
            {matchResult && !isLoading && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold">Fit Score</h4>
                    <span className="text-primary font-bold">{matchResult.fitScore}%</span>
                  </div>
                  <Progress value={matchResult.fitScore} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Personalized Explanation</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {matchResult.explanation}
                  </p>
                </div>
                {matchResult.fitScore > 70 && (
                     <Button asChild className="w-full">
                        <Link href={`/plan?career=${selectedCareer?.id}`}>Generate Your Action Plan</Link>
                    </Button>
                )}
              </div>
            )}
            {!matchResult && !isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <Bot size={48} className="mx-auto mb-4 text-muted-foreground"/>
                    <p>Something went wrong, or the AI is still thinking.</p>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
