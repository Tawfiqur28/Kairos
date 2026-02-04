'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { ActionPlan, Ikigai } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { Calendar, GraduationCap, Target, Clock, Award, TrendingUp, AlertCircle, Download, Share2, Printer, RefreshCw, Home, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { generatePersonalizedActionPlan } from '@/ai/flows/generate-personalized-action-plan';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlanPage() {
  const [plan, setPlan] = useLocalStorage<ActionPlan | null>('action-plan', null);
  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
    educationLevel: undefined
  });
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleTaskToggle = (phaseIndex: number, taskId: string) => {
    if (!plan) return;

    const newPlan = { ...plan };
    const task = newPlan.phases[phaseIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setPlan(newPlan);
      
      // Show toast for task completion
      if (task.completed) {
        toast({
          title: t('plan.taskCompletedToast'),
          description: t('plan.taskCompletedToastDesc', { taskText: task.text }),
          variant: 'default',
        });
      }
    }
  };

  const { overallProgress, phaseProgress, totalTasks, completedTasks, daysRemaining } = useMemo(() => {
    if (!plan) return { 
      overallProgress: 0, 
      phaseProgress: [], 
      totalTasks: 0, 
      completedTasks: 0,
      daysRemaining: 0
    };

    const phaseProgress = plan.phases.map(phase => {
      const total = phase.tasks.length;
      if (total === 0) return 0;
      const completed = phase.tasks.filter(t => t.completed).length;
      return (completed / total) * 100;
    });

    const totalTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
    const completedTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 0);
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate estimated days remaining (assuming 1 task per week)
    const estimatedDays = (totalTasks - completedTasks) * 7;

    return { 
      overallProgress, 
      phaseProgress, 
      totalTasks, 
      completedTasks,
      daysRemaining: estimatedDays
    };
  }, [plan]);

  const educationLevelMap: Record<string, string> = {
    highSchool: 'High School Student',
    undergrad: 'Undergraduate Student',
    masters: 'Master\'s Student',
    phd: 'PhD/Doctoral Candidate',
    professional: 'Working Professional',
    notSpecified: 'Not Specified'
  };
  
  const displayEducationLevel = plan?.educationLevel && educationLevelMap[plan.educationLevel] 
    ? educationLevelMap[plan.educationLevel] 
    : plan?.educationLevel || 'Not Specified';

  const handleRegeneratePlan = async () => {
    if (!plan || !ikigai) return;
    
    setIsRegenerating(true);
    try {
      const userDetails = `Passions: ${ikigai.passions || ''}. Skills: ${ikigai.skills || ''}. Values: ${ikigai.values || ''}. Interests: ${ikigai.interests || ''}. Education Level: ${ikigai.educationLevel || ''}.`;
      
      const newPlan = await generatePersonalizedActionPlan({
        careerGoal: plan.careerTitle,
        userDetails,
        useAIFallback: true
      });
      
      setPlan(newPlan);
      toast({
        title: t('plan.regeneratedToast'),
        description: t('plan.regeneratedToastDesc'),
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
      toast({
        title: t('plan.regenerateFailedToast'),
        description: t('plan.regenerateFailedToastDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPlan = () => {
    if (!plan) return;
    
    const planText = `
ACTION PLAN: ${plan.careerTitle}
Education Level: ${displayEducationLevel}
Timeline: ${plan.timeline}
Generated: ${plan.generatedAt ? new Date(plan.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
Progress: ${Math.round(overallProgress)}% (${completedTasks}/${totalTasks} tasks)

${plan.phases.map((phase, idx) => `
PHASE ${idx + 1}: ${phase.title} (${phase.duration})
${phase.tasks.map(task => `[${task.completed ? '✓' : ' '}] ${task.text}`).join('\n')}
`).join('\n')}

Generated by KAIROS Career Planner
    `.trim();
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KAIROS-Action-Plan-${plan.careerTitle.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('plan.exportedToast'),
      description: t('plan.exportedToastDesc'),
      variant: 'default',
    });
  };

  const handlePrintPlan = () => {
    window.print();
  };

  if (!hasMounted) {
    return (
      <>
        <PageHeader 
          title={t('plan.title')} 
          description={t('plan.description')} 
        />
        
        {/* Progress Overview Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-36" />
                </div>
              </div>
              <div className="space-y-2 w-full md:w-1/4">
                <Skeleton className="h-8 w-3/4 ml-auto" />
                <Skeleton className="h-4 w-1/2 ml-auto" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 justify-between border-t pt-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardFooter>
        </Card>

        {/* Plan Phases Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('plan.planPhasesTitle')}</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-4 w-28 mt-1" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <PageHeader 
          title={t('plan.noPlanFound')}
          description={t('plan.noPlanFoundDesc')}
        />
        <div className="space-y-6 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                {t('plan.noActivePlan')}
              </CardTitle>
              <CardDescription>
                {t('plan.noActivePlanDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{t('plan.howToStart')}</p>
                    <ol className="text-sm text-muted-foreground mt-1 ml-5 list-decimal">
                      <li>{t('plan.howToStartStep1')}</li>
                      <li>{t('plan.howToStartStep2')}</li>
                      <li>{t('plan.howToStartStep3')}</li>
                      <li>{t('plan.howToStartStep4')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/careers">
                  <Briefcase className="mr-2 h-4 w-4" />
                  {t('plan.exploreAndGenerate')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/ikigai">
                  <Target className="mr-2 h-4 w-4" />
                  {t('plan.completeProfileFirst')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title={t('plan.title')} 
        description={t('plan.description')} 
      />
      
      {/* Progress Overview Card */}
      <Card className="mb-6 border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl">{plan.careerTitle}</CardTitle>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {t('dashboard.activePlan')}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{displayEducationLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{plan.timeline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('plan.daysRemaining', { days: daysRemaining })}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}% Complete</div>
              <p className="text-sm text-muted-foreground">
                {t('plan.tasksCompleted', { completed: completedTasks, total: totalTasks })}
              </p>
              <Progress value={overallProgress} className="w-full h-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{t('plan.currentPhase')}</span>
              </div>
              <div className="text-lg font-bold">
                {phaseProgress.findIndex(p => p < 100) + 1 || plan.phases.length}
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{t('plan.successRate')}</span>
              </div>
              <div className="text-lg font-bold">
                {completedTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{t('plan.momentum')}</span>
              </div>
              <div className="text-lg font-bold">
                {completedTasks === 0 ? t('plan.startNow') : t('plan.keepGoing')}
              </div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">{t('plan.estimated')}</span>
              </div>
              <div className="text-lg font-bold">
                {Math.ceil(daysRemaining / 30)} {t('plan.months')}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPlan}>
              <Download className="mr-2 h-3 w-3" />
              {t('plan.export')}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintPlan}>
              <Printer className="mr-2 h-3 w-3" />
              {t('plan.print')}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/careers">
                <Share2 className="mr-2 h-3 w-3" />
                {t('plan.share')}
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/careers">
                <Home className="mr-2 h-3 w-3" />
                {t('plan.backToCareers')}
              </Link>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRegeneratePlan}
              disabled={isRegenerating}
            >
              <RefreshCw className={`mr-2 h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? t('plan.regenerating') : t('plan.regenerate')}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Plan Phases */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('plan.planPhasesTitle')}</h2>
          <Badge variant="outline">
            {completedTasks > 0 ? t('plan.inProgress') : t('plan.readyToStart')}
          </Badge>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plan.phases.map((phase, phaseIndex) => (
            <Card key={phaseIndex} className={phaseProgress[phaseIndex] === 100 ? 'border-green-200 dark:border-green-800' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      phaseProgress[phaseIndex] === 100 ? 'bg-green-500' : 
                      phaseProgress[phaseIndex] > 0 ? 'bg-yellow-500' : 
                      'bg-gray-300'
                    }`} />
                    {phase.title}
                  </CardTitle>
                  <Badge variant={phaseProgress[phaseIndex] === 100 ? "default" : "outline"}>
                    {phase.duration}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Progress value={phaseProgress[phaseIndex]} className="h-2 flex-1" />
                  <span className="text-sm font-semibold text-primary">
                    {Math.round(phaseProgress[phaseIndex])}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('plan.tasksOfTotal', { completed: phase.tasks.filter(t => t.completed).length, total: phase.tasks.length })}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {phase.tasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(phaseIndex, task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.text}
                      </label>
                      {task.completed && (
                        <div className="flex items-center gap-1 mt-1">
                          <Award className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
              {phaseProgress[phaseIndex] === 100 && (
                <CardFooter className="bg-green-50 dark:bg-green-900/20 border-t">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                    <Award className="h-4 w-4" />
                    {t('plan.phaseCompleted')}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Tips & Motivation Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('plan.tipsForSuccess')}</CardTitle>
          <CardDescription>
            {t('plan.tipsForSuccessDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">{t('plan.tip1_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('plan.tip1_text')}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">{t('plan.tip2_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('plan.tip2_text')}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">{t('plan.tip3_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('plan.tip3_text')}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">{t('plan.tip4_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('plan.tip4_text')}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              {t('plan.returnToDashboard')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
