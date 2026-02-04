'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { ActionPlan } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { Calendar, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function PlanPage() {
  const [plan, setPlan] = useLocalStorage<ActionPlan | null>('action-plan', null);
  const { t } = useLanguage();

  const handleTaskToggle = (phaseIndex: number, taskId: string) => {
    if (!plan) return;

    const newPlan = { ...plan };
    const task = newPlan.phases[phaseIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setPlan(newPlan);
    }
  };

  const { overallProgress, phaseProgress, totalTasks, completedTasks } = useMemo(() => {
    if (!plan) return { overallProgress: 0, phaseProgress: [], totalTasks: 0, completedTasks: 0 };

    const phaseProgress = plan.phases.map(phase => {
      const total = phase.tasks.length;
      if (total === 0) return 0;
      const completed = phase.tasks.filter(t => t.completed).length;
      return (completed / total) * 100;
    });

    const totalTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
    const completedTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 0);
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return { overallProgress, phaseProgress, totalTasks, completedTasks };
  }, [plan]);

  const educationLevelMap: Record<string, string> = {
    highSchool: 'High School Student',
    undergrad: 'Undergraduate Student',
    masters: 'Master\'s Student',
    phd: 'PhD/Doctoral Candidate',
  };
  const displayEducationLevel = plan?.educationLevel && educationLevelMap[plan.educationLevel] ? educationLevelMap[plan.educationLevel] : plan?.educationLevel;


  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <PageHeader title="No Action Plan Found" description="Generate a plan from the Careers page to see it here." />
        <Button asChild className="mt-4">
            <Link href="/careers">Explore Careers</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t('plan.title')} description={t('plan.description')} />
      
      <Card className="mb-6">
        <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <CardTitle className="text-3xl">{plan.careerTitle}</CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span>{displayEducationLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{plan.timeline}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-primary">{Math.round(overallProgress)}% Complete</div>
                    <p className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks done</p>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Progress value={overallProgress} className="w-full h-3" />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plan.phases.map((phase, phaseIndex) => (
          <Card key={phaseIndex}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{phase.title}</span>
                <span className="text-sm font-medium text-muted-foreground">{phase.duration}</span>
              </CardTitle>
               <div className="flex items-center gap-2 pt-2">
                <Progress value={phaseProgress[phaseIndex]} className="h-2" />
                <span className="text-xs text-muted-foreground font-semibold">{Math.round(phaseProgress[phaseIndex])}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {phase.tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(phaseIndex, task.id)}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[completed=true]:line-through data-[completed=true]:text-muted-foreground"
                    data-completed={task.completed}
                  >
                    {task.text}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
