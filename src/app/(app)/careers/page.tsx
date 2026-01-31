'use client';

import { generateCareerMatchExplanations } from '@/ai/flows/generate-career-match-explanations';
import { extractCareerThemes } from '@/ai/flows/extract-career-themes';
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
import type { Career, Ikigai, ActionPlan as SpicyPlanData } from '@/lib/types';
import { Bot, Loader2, Sparkles, ArrowLeft, Lightbulb, Zap, GanttChartSquare } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { generatePersonalizedActionPlan } from '@/ai/flows/generate-personalized-action-plan';

type MatchResult = {
  explanation: string;
  skillMatch: number;
  interestMatch: number;
  valueAlignment: number;
  fitScore: number;
};

// New Spicy Action Plan component
function GamifiedActionPlan({
  plan,
  careerTitle,
  onBack,
  isLoading,
  onRegenerate,
}: {
  plan: SpicyPlanData | null;
  careerTitle: string;
  onBack: () => void;
  isLoading: boolean;
  onRegenerate: () => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              Crafting Your Quest...
            </CardTitle>
            <Button variant="ghost" onClick={onBack} disabled>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">AI is forging your epic journey into {careerTitle}!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              Action Plan Generation
            </CardTitle>
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center p-8">
            <p className="mb-4 text-muted-foreground">Something went wrong. Click to try generating your plan again.</p>
            <Button onClick={onRegenerate}>
              <Sparkles className="mr-2 h-4 w-4" />
              Re-generate Plan
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border-2 border-primary/20 rounded-xl p-6 bg-gradient-to-br from-card to-muted/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🎯 {plan.missionName}
          </h2>
          <p className="text-muted-foreground">Your Gamified Action Plan for becoming a {careerTitle}</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Careers
        </Button>
      </div>
    
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 mt-6 p-4 bg-background/50 rounded-lg shadow-inner border">
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-h3:font-headline prose-h3:text-primary prose-h3:flex prose-h3:items-center prose-strong:text-foreground prose-ul:list-none prose-ul:p-0 prose-li:mb-2 prose-li:flex prose-li:items-start" 
                dangerouslySetInnerHTML={{ __html: plan.threeYearPlan }} />
        </div>
        
        <div className="space-y-6">
          <div className="mt-6 p-4 bg-background/50 rounded-lg shadow-inner border">
            <h3 className="text-lg font-bold flex items-center mb-4 font-headline">
              <Lightbulb className="mr-2 text-yellow-400" />
              Industry Insider Tips
            </h3>
            <ul className="space-y-3 text-sm">
              {plan.spicyTips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-1">💡</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-background/50 rounded-lg shadow-inner border">
            <h3 className="text-lg font-bold flex items-center mb-4 font-headline">
              <Zap className="mr-2 text-blue-400" />
              Monthly Field Intel
            </h3>
            <ul className="space-y-3 text-sm">
              {plan.monthlyUpdates.map((update, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-1">📈</span>
                  <span className="text-muted-foreground">{update}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function CareersPage() {
  const allCareers: Career[] = careerData.careers;
  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  });

  const [sortedCareers, setSortedCareers] = useState<Career[]>(allCareers);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  const [view, setView] = useState<'careers' | 'plan'>('careers');
  const [careerForPlan, setCareerForPlan] = useState<Career | null>(null);
  const [gamifiedPlan, setGamifiedPlan] = useState<SpicyPlanData | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const isProfileComplete = useMemo(() => 
    ikigai.passions && ikigai.skills && ikigai.values && ikigai.interests,
    [ikigai]
  );
  
  const userProfileString = useMemo(() => 
    `Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}.`,
    [ikigai]
  );

  useEffect(() => {
    setHasMounted(true);
    if (isProfileComplete) {
      extractCareerThemes(userProfileString).then(themes => {
        if (themes.length > 0) {
          const reorderedCareers = [...allCareers].sort((a, b) => {
            const aInTheme = themes.includes(a.cluster);
            const bInTheme = themes.includes(b.cluster);
            if (aInTheme && !bInTheme) return -1;
            if (!aInTheme && bInTheme) return 1;
            return 0;
          });
          setSortedCareers(reorderedCareers);
        }
      });
    } else {
      setSortedCareers(allCareers);
    }
  }, [isProfileComplete, userProfileString]);


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
      const careerDetailsString = `${career.description} Required skills: ${career.requiredSkills.join(', ')}.`;

      const result = await generateCareerMatchExplanations({
        userProfile: userProfileString,
        career: career.title,
        careerDetails: careerDetailsString,
      });

      // The AI model now returns overallScore, which we will use instead of fitScore
      setMatchResult({ ...result, fitScore: result.overallScore });

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: error.message || 'Could not generate a career match at this time.',
        variant: 'destructive',
      });
      setSelectedCareer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async (career: Career) => {
    setView('plan');
    setCareerForPlan(career);
    setIsLoadingPlan(true);
    setGamifiedPlan(null);
    setSelectedCareer(null);

    try {
      const result = await generatePersonalizedActionPlan({
        careerGoal: career.title,
        userDetails: userProfileString,
      });

      if (!result || !result.missionName) {
        throw new Error('AI failed to generate a valid plan.');
      }
      setGamifiedPlan(result);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'AI Error',
        description:
          error.message || 'Could not generate an action plan at this time.',
        variant: 'destructive',
      });
      // Go back to careers view on error
      setView('careers');
      setCareerForPlan(null);
    } finally {
      setIsLoadingPlan(false);
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
      ) : !isProfileComplete && view === 'careers' && (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
                <CardTitle className="text-yellow-900 dark:text-yellow-300">Complete Your Profile</CardTitle>
                <CardDescription className="text-yellow-800 dark:text-yellow-400">
                    Your Ikigai Canvas is empty. Please fill it out to enable AI career matching and sorting.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button variant="secondary" asChild>
                    <Link href="/ikigai">Go to Ikigai Canvas</Link>
                </Button>
            </CardFooter>
        </Card>
      )}

      <AnimatePresence mode="wait">
        {view === 'careers' && hasMounted ? (
          <motion.div
            key="careers-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedCareers.map((career) => (
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
          </motion.div>
        ) : view === 'plan' && careerForPlan && (
          <motion.div
            key="plan-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GamifiedActionPlan
              plan={gamifiedPlan}
              careerTitle={careerForPlan.title}
              isLoading={isLoadingPlan}
              onBack={() => {
                setView('careers');
                setCareerForPlan(null);
              }}
              onRegenerate={() => handleGeneratePlan(careerForPlan)}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                {matchResult.fitScore > 60 ? (
                    <Button onClick={() => handleGeneratePlan(selectedCareer!)} className="w-full">
                       <GanttChartSquare className="mr-2 h-4 w-4" />
                        Generate Your Action Plan
                    </Button>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold">Keep Exploring!</p>
                    <p className="text-sm text-muted-foreground">This career might not be the strongest match right now. Check out other options!</p>
                  </div>
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
