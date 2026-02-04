'use client';

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
import { ArrowRight, Briefcase, Target, FileText, CheckCircle, AlertCircle, Sparkles, GanttChartSquare } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import type { Ikigai, ActionPlan } from '@/lib/types';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
    educationLevel: ''
  });
  const [actionPlan, setActionPlan] = useLocalStorage<ActionPlan | null>('action-plan', null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Check if profile is complete
  const isProfileComplete = hasMounted && ikigai.passions && ikigai.skills && ikigai.values && ikigai.interests;
  
  // Calculate completion percentage
  const calculateProfileCompletion = () => {
    if (!hasMounted) return 0;
    
    let completed = 0;
    const fields = ['passions', 'skills', 'values', 'interests', 'educationLevel'];
    
    fields.forEach(field => {
      if (ikigai[field as keyof Ikigai]) completed++;
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const hasActionPlan = hasMounted && actionPlan && actionPlan.phases && actionPlan.phases.length > 0;

  return (
    <>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      {/* Profile Status Banner */}
      {hasMounted && !isProfileComplete && profileCompletion < 80 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">
                Complete Your Profile for Better Career Matches
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
                A complete profile ensures accurate career matching. 
                {profileCompletion === 0 ? ' Start by filling out your Ikigai profile.' : ` You're ${profileCompletion}% complete.`}
              </p>
              {profileCompletion > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              )}
            </div>
            <Button size="sm" asChild variant="outline" className="border-yellow-300">
              <Link href="/ikigai">
                {profileCompletion === 0 ? 'Start Profile' : 'Complete Profile'}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Success Banner - Profile Complete */}
      {hasMounted && isProfileComplete && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-300">
                Profile Complete! Ready for Career Exploration
              </h3>
              <p className="text-sm text-green-800 dark:text-green-400">
                Your profile has been analyzed. Explore careers that match your unique strengths.
              </p>
            </div>
            <Badge variant="outline" className="border-green-300 text-green-700 dark:text-green-300">
              Ready
            </Badge>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Ikigai Profile Card */}
        <Card className={!isProfileComplete ? 'border-yellow-200 dark:border-yellow-800' : 'border-green-200 dark:border-green-800'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.step1_title')}
              </CardTitle>
              {isProfileComplete && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </div>
            <Target className={`h-4 w-4 ${isProfileComplete ? 'text-green-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{t('dashboard.step1_card_title')}</div>
            <p className="text-xs text-muted-foreground mb-4">
              {t('dashboard.step1_card_text')}
            </p>
            
            {hasMounted && (
              <div className="space-y-3 mb-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-1.5" />
                </div>
                
                {!isProfileComplete && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    {profileCompletion === 0 ? 
                      'Start by defining your passions, skills, values, and interests.' : 
                      `${4 - Math.floor(profileCompletion/25)} sections remaining.`}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant={isProfileComplete ? "outline" : "default"}>
              <Link href="/ikigai">
                {isProfileComplete ? 'Update Profile' : t('dashboard.step1_card_cta')} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Career Explorer Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.step2_title')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{t('dashboard.step2_card_title')}</div>
            <p className="text-xs text-muted-foreground mb-4">
              {t('dashboard.step2_card_text')}
            </p>
            
            {hasMounted && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Status</span>
                  <Badge variant={isProfileComplete ? "default" : "outline"}>
                    {isProfileComplete ? 'Ready' : 'Incomplete'}
                  </Badge>
                </div>
                
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <p className="text-xs font-medium mb-1">💡 Dynamic Career Matching</p>
                  <p className="text-xs text-muted-foreground">
                    {isProfileComplete ? 
                      'Get personalized fit scores based on your unique profile.' :
                      'Complete your profile first to see accurate career matches.'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMounted || !isProfileComplete}>
              <Link href="/careers">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('dashboard.step2_card_cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Action Plan & Progress Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.progress_title')}</CardTitle>
              {hasActionPlan && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Active Plan
                </Badge>
              )}
            </div>
            <CardDescription>
              {t('dashboard.progress_text')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasMounted ? (
              <div className="space-y-4">
                {hasActionPlan ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <GanttChartSquare className="h-4 w-4 text-primary" />
                        <h4 className="font-medium text-primary">Active Action Plan</h4>
                      </div>
                      <p className="text-sm mb-2">{actionPlan!.careerTitle}</p>
                      <div className="text-xs text-muted-foreground">
                        {actionPlan!.timeline} • {actionPlan!.educationLevel}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Plan Progress</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Start working on your first task to track progress.
                      </p>
                    </div>
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/plan">
                        View My Action Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : isProfileComplete ? (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h4 className="font-medium mb-1">No Action Plan Yet</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Generate a personalized action plan after exploring careers.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/careers">
                        Explore Careers First
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h4 className="font-medium mb-1">Start Your Journey</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Complete your profile to unlock career matching and action plans.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/ikigai">
                        Create Your Profile
                      </Link>
                    </Button>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Journey Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Profile Setup</span>
                      <Badge variant={isProfileComplete ? "default" : "outline"} size="sm">
                        {isProfileComplete ? '✓' : '—'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Career Exploration</span>
                      <Badge variant={isProfileComplete ? "outline" : "secondary"} size="sm">
                        {isProfileComplete ? 'Ready' : 'Locked'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Action Plan</span>
                      <Badge variant={hasActionPlan ? "default" : "outline"} size="sm">
                        {hasActionPlan ? 'Active' : '—'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('dashboard.progress_subtext')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips Section */}
      {hasMounted && isProfileComplete && (
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/10 rounded-xl border">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tips for Better Career Matching
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <h4 className="font-medium mb-1 text-sm">Dynamic Scoring</h4>
              <p className="text-xs text-muted-foreground">
                Each career gets a unique fit score based on your profile, not a fixed percentage.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <h4 className="font-medium mb-1 text-sm">Theme-Based Matching</h4>
              <p className="text-xs text-muted-foreground">
                Careers are matched to your detected themes (Tech, Science, Arts, etc.).
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <h4 className="font-medium mb-1 text-sm">Generation Plan</h4>
              <p className="text-xs text-muted-foreground">
                Generate personalized action plans with specific tasks and timelines.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}