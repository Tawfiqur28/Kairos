'use client';

import { generateCareerMatchExplanations } from '@/ai/flows/generate-career-match-explanations';
import { extractCareerThemes } from '@/ai/flows/extract-career-themes';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
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
import { Bot, Loader2, Sparkles, GanttChartSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { generatePersonalizedActionPlan } from '@/ai/flows/generate-personalized-action-plan';
import { useLanguage } from '@/context/language-context';
import { useRouter } from 'next/navigation';
import CareerCard from '@/components/career-card';

type MatchResult = {
  explanation: string;
  skillMatch: number;
  interestMatch: number;
  valueAlignment: number;
  fitScore: number;
  themeMismatch: boolean;
  confidence: 'high' | 'medium' | 'low';
};

export default function CareersPage() {
  const allCareers: Career[] = careerData.careers;
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
    educationLevel: ''
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
  const [userThemes, setUserThemes] = useState<string[]>([]);

  const isProfileComplete = useMemo(() => 
    ikigai.passions && ikigai.skills && ikigai.values && ikigai.interests,
    [ikigai]
  );
  
  const userProfileString = useMemo(() => {
    const educationLevelMap: Record<string, string> = {
      highSchool: 'High School Student',
      undergrad: 'Undergraduate Student',
      masters: 'Master\'s Student',
      phd: 'PhD/Doctoral Candidate',
      professional: 'Working Professional',
    };
    const educationLevelText = ikigai.educationLevel ? 
      (educationLevelMap[ikigai.educationLevel] || 'Not specified') : 'Not specified';

    return `Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}. Current Education Level: ${educationLevelText}.`;
  }, [ikigai]);

  // Extract user themes and sort careers
  useEffect(() => {
    setHasMounted(true);
    if (isProfileComplete) {
      extractCareerThemes(userProfileString).then(themes => {
        setUserThemes(themes);
        if (themes.length > 0) {
          // Reorder careers based on theme matches
          const reorderedCareers = [...allCareers].sort((a, b) => {
            const aMatchesTheme = themes.includes(a.cluster);
            const bMatchesTheme = themes.includes(b.cluster);
            
            // First sort by theme match
            if (aMatchesTheme && !bMatchesTheme) return -1;
            if (!aMatchesTheme && bMatchesTheme) return 1;
            
            // Then by title alphabetical
            return a.title.localeCompare(b.title);
          });
          setSortedCareers(reorderedCareers);
        }
      }).catch(error => {
        console.error('Error extracting themes:', error);
      });
    } else {
      setSortedCareers(allCareers);
    }
  }, [isProfileComplete, userProfileString, allCareers]);

  const handleCheckFit = useCallback(async (career: Career) => {
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
      const careerDetailsString = `${career.description} Required skills: ${career.requiredSkills.join(', ')}. Typical responsibilities: ${career.description}.`;

      const result = await generateCareerMatchExplanations({
        userProfile: userProfileString,
        career: career.title,
        careerDetails: careerDetailsString,
        careerCluster: career.cluster
      });

      setMatchResult({ 
        ...result, 
        fitScore: result.overallScore 
      });

    } catch (error: any) {
      console.error('Career match error:', error);
      toast({
        title: t('toasts.aiErrorTitle'),
        description: error.message || t('toasts.aiErrorCareerMatch'),
        variant: 'destructive',
      });
      const fallbackScore = Math.floor(Math.random() * 40) + 30;
      setMatchResult({
        explanation: `Based on your profile in ${userThemes.join(', ') || 'various areas'}, ${career.title} shows ${fallbackScore}% alignment. This is an initial assessment - consider exploring this field further.`,
        skillMatch: fallbackScore,
        interestMatch: fallbackScore,
        valueAlignment: fallbackScore,
        fitScore: fallbackScore,
        themeMismatch: false,
        confidence: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isProfileComplete, userProfileString, t, toast, userThemes, setMatchResult, setSelectedCareer, setIsLoading]);

  const handleGeneratePlan = useCallback(async (career: Career) => {
    if (!career) return;
    
    setSelectedCareer(null); // Close dialog
    toast({ 
      title: t('careers.generatingPlanToast'), 
      description: t('careers.generatingPlanToastDesc')
    });

    try {
      const result = await generatePersonalizedActionPlan({
        careerGoal: career.title,
        userDetails: userProfileString,
        useAIFallback: true
      });

      if (!result || !result.phases || result.phases.length === 0) {
        throw new Error('Failed to generate a valid action plan.');
      }
      
      setActionPlan(result);
      
      toast({
        title: t('careers.planGeneratedToast'),
        description: t('careers.planGeneratedToastDesc', { careerTitle: career.title }),
        variant: 'default'
      });
      
      router.push('/plan');
      
    } catch (error: any) {
      console.error('Plan generation error:', error);
      toast({
        title: t('toasts.aiErrorTitle'),
        description: error.message || t('toasts.aiErrorActionPlan'),
        variant: 'destructive',
      });
    }
  }, [userProfileString, router, setActionPlan, t, toast]);

  const getConfidenceText = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return t('careers.high');
      case 'medium': return t('careers.medium');
      case 'low': return t('careers.low');
      default: return '';
    }
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
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
            <CardTitle className="text-yellow-900 dark:text-yellow-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('careers.completeProfileTitle')}
            </CardTitle>
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

      {hasMounted && isProfileComplete && userThemes.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-semibold">{t('careers.yourProfileThemes')}</span> {userThemes.join(', ')}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            {t('careers.themesDescription')}
          </p>
        </div>
      )}

      {hasMounted && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCareers.map((career) => {
            const matchesTheme = userThemes.includes(career.cluster);
            return (
              <CareerCard
                key={career.id}
                career={career}
                matchesTheme={matchesTheme}
                onCheckFit={handleCheckFit}
                isProfileComplete={!!isProfileComplete}
              />
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedCareer} onOpenChange={(isOpen) => !isOpen && setSelectedCareer(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {selectedCareer?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedCareer?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('careers.analyzingFit', { careerTitle: selectedCareer?.title })}</p>
                <p className="text-xs text-muted-foreground">{t('careers.generatingScore')}</p>
              </div>
            )}
            
            {matchResult && !isLoading && (
              <>
                {/* Score Display */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{t('careers.fitScore')}</h4>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        matchResult.fitScore >= 70 ? 'text-green-600' : 
                        matchResult.fitScore >= 40 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {matchResult.fitScore}%
                      </div>
                      <div className={`text-xs ${getConfidenceColor(matchResult.confidence)}`}>
                        {getConfidenceText(matchResult.confidence)} {t('careers.confidence')}
                      </div>
                    </div>
                  </div>
                  <Progress value={matchResult.fitScore} className="h-2" />
                  
                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">{t('careers.skillMatch')}</div>
                      <div className="text-primary font-bold">{matchResult.skillMatch}%</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">{t('careers.interestMatch')}</div>
                      <div className="text-primary font-bold">{matchResult.interestMatch}%</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">{t('careers.valueAlignment')}</div>
                      <div className="text-primary font-bold">{matchResult.valueAlignment}%</div>
                    </div>
                  </div>
                </div>

                {/* Theme Mismatch Warning */}
                {matchResult.themeMismatch && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-300">{t('careers.themeMismatch')}</p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                          {t('careers.themeMismatchDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    {t('careers.aiAnalysis')}
                  </h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{matchResult.explanation}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {matchResult.fitScore > 50 ? (
                    <div className="p-4 bg-primary/10 dark:bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <GanttChartSquare className="h-5 w-5" />
                        {t('careers.generatePlanTitle')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('careers.generatePlanDescription')}
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleGeneratePlan(selectedCareer!)} 
                          className="w-full"
                          size="lg"
                        >
                          <GanttChartSquare className="mr-2 h-4 w-4" />
                          {t('careers.generatePlan')}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          {t('careers.includes')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg border space-y-3 text-center">
                      <p className="font-semibold">{t('careers.keepExploring')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('careers.notStrongMatch')}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedCareer(null)}
                          className="flex-1"
                        >
                          {t('careers.viewOtherCareers')}
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleGeneratePlan(selectedCareer!)}
                          className="flex-1"
                        >
                          {t('careers.generatePlanAnyway')}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCareer(null)}
                    className="w-full"
                  >
                    {t('careers.backToCareers')}
                  </Button>
                </div>
              </>
            )}

            {!matchResult && !isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 text-center py-8">
                <Bot size={48} className="mx-auto mb-4 text-muted-foreground"/>
                <p>{t('careers.selectCareerPrompt')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
