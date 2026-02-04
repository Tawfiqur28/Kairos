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
import type { Career, Ikigai, ActionPlan } from '@/lib/types';
import { Bot, Loader2, Sparkles, GanttChartSquare } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { generatePersonalizedActionPlan } from '@/ai/flows/generate-personalized-action-plan';
import { useLanguage } from '@/context/language-context';
import { useRouter } from 'next/navigation';

type MatchResult = {
  explanation: string;
  skillMatch: number;
  interestMatch: number;
  valueAlignment: number;
  fitScore: number;
};

export default function CareersPage() {
  const allCareers: Career[] = careerData.careers;
  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  });
  const { t } = useLanguage();
  const router = useRouter();

  const [sortedCareers, setSortedCareers] = useState<Career[]>(allCareers);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setActionPlan] = useLocalStorage<ActionPlan | null>('action-plan', null);


  const [hasMounted, setHasMounted] = useState(false);

  const isProfileComplete = useMemo(() => 
    ikigai.passions && ikigai.skills && ikigai.values && ikigai.interests,
    [ikigai]
  );
  
  const userProfileString = useMemo(() => {
    const educationLevelMap = {
      highSchool: 'High School Student',
      undergrad: 'Undergraduate Student',
      masters: 'Master\'s Student',
      phd: 'PhD/Doctoral Candidate',
    };
    const educationLevelText = ikigai.educationLevel ? educationLevelMap[ikigai.educationLevel] : 'Not specified';

    return `Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}. Current Education Level: ${educationLevelText}.`;
  },
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
        title: t('toasts.profileIncompleteTitle'),
        description: t('toasts.profileIncompleteDescription'),
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
        title: t('toasts.aiErrorTitle'),
        description: error.message || t('toasts.aiErrorCareerMatch'),
        variant: 'destructive',
      });
      setSelectedCareer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async (career: Career) => {
    setSelectedCareer(null); // Close dialog

    toast({ title: 'Generating Your Action Plan...', description: 'The AI is building your roadmap. This may take a moment.' });

    try {
      const result = await generatePersonalizedActionPlan({
        careerGoal: career.title,
        userDetails: userProfileString,
      });

      if (!result || !result.phases || result.phases.length === 0) {
        throw new Error('AI failed to generate a valid plan.');
      }
      setActionPlan(result);
      router.push('/plan');
    } catch (error: any) {
      console.error(error);
      toast({
        title: t('toasts.aiErrorTitle'),
        description:
          error.message || t('toasts.aiErrorActionPlan'),
        variant: 'destructive',
      });
    }
  };


  return (
    <>
      <PageHeader
        title={t('careers.title')}
        description={t('careers.description')}
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
                <CardTitle className="text-yellow-900 dark:text-yellow-300">{t('careers.completeProfileTitle')}</CardTitle>
                <CardDescription className="text-yellow-800 dark:text-yellow-400">
                    {t('careers.completeProfileDescription')}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button variant="secondary" asChild>
                    <Link href="/ikigai">{t('careers.goToIkigai')}</Link>
                </Button>
            </CardFooter>
        </Card>
      )}

      {hasMounted && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedCareers.map((career) => (
            <Card key={career.id}>
                <CardHeader>
                <CardTitle>{career.title}</CardTitle>
                <CardDescription>{career.description}</CardDescription>
                </CardHeader>
                <CardContent>
                <h4 className="text-sm font-semibold mb-2">{t('careers.keySkills')}</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {career.requiredSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                    ))}
                </ul>
                </CardContent>
                <CardFooter>
                <Button onClick={() => handleCheckFit(career)} disabled={!hasMounted || !isProfileComplete}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('careers.checkFit')}
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}

      <Dialog open={!!selectedCareer} onOpenChange={(isOpen) => !isOpen && setSelectedCareer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('careers.dialogTitle', { career: selectedCareer?.title })}</DialogTitle>
            <DialogDescription>
              {t('careers.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>{t('careers.aiLoading')}</p>
              </div>
            )}
            {matchResult && !isLoading && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold">{t('careers.fitScore')}</h4>
                    <span className="text-primary font-bold">{matchResult.fitScore}%</span>
                  </div>
                  <Progress value={matchResult.fitScore} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('careers.explanation')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {matchResult.explanation}
                  </p>
                </div>
                {matchResult.fitScore > 60 ? (
                    <Button onClick={() => handleGeneratePlan(selectedCareer!)} className="w-full">
                       <GanttChartSquare className="mr-2 h-4 w-4" />
                        {t('careers.generatePlan')}
                    </Button>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold">{t('careers.keepExploring')}</p>
                    <p className="text-sm text-muted-foreground">{t('careers.notStrongMatch')}</p>
                  </div>
                )}
              </div>
            )}
            {!matchResult && !isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <Bot size={48} className="mx-auto mb-4 text-muted-foreground"/>
                    <p>{t('careers.errorText')}</p>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
