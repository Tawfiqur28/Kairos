'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  BrainCircuit,
  PenSquare,
  Mic,
  Target,
  Sparkles,
  GanttChartSquare,
  AlertCircle,
  Zap,
  BarChart,
  Code,
  BookOpen,
  Users,
  Rocket
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LearnMorePage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: t('learnMore.feature1_title'),
      description: t('learnMore.feature1_text'),
      highlight: "Dynamic scoring prevents generic 50% matches",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    },
    {
      icon: <Mic className="h-8 w-8 text-primary" />,
      title: t('learnMore.feature2_title'),
      description: t('learnMore.feature2_text'),
      highlight: "Voice-to-text for easy journaling",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: t('learnMore.feature3_title'),
      description: t('learnMore.feature3_text'),
      highlight: "AI-powered personalized analysis",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    },
    {
      icon: <PenSquare className="h-8 w-8 text-primary" />,
      title: t('learnMore.feature4_title'),
      description: t('learnMore.feature4_text'),
      highlight: "Interactive journal with mood tracking",
      color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: t('learnMore.feature5_title'),
      description: t('learnMore.feature5_text'),
      highlight: "Theme-based career matching",
      color: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800"
    },
    {
      icon: <GanttChartSquare className="h-8 w-8 text-primary" />,
      title: t('learnMore.feature6_title'),
      description: t('learnMore.feature6_text'),
      highlight: t('learnMore.feature6_highlight'),
      color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: t('learnMore.step1_title'),
      description: t('learnMore.step1_text'),
      icon: <BookOpen className="h-6 w-6" />,
      keyPoint: "Detailed profiles = accurate matching"
    },
    {
      step: 2,
      title: t('learnMore.step2_title'),
      description: t('learnMore.step2_text'),
      icon: <BarChart className="h-6 w-6" />,
      keyPoint: "Dynamic scores, not fixed percentages"
    },
    {
      step: 3,
      title: t('learnMore.step3_title'),
      description: t('learnMore.step3_text'),
      icon: <GanttChartSquare className="h-6 w-6" />,
      keyPoint: "Actionable 3-phase career plans"
    }
  ];

  const problemSolution = [
    {
      problem: t('learnMore.problem1'),
      solution: t('learnMore.solution1'),
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      description: t('learnMore.problem1_desc')
    },
    {
      problem: t('learnMore.problem2'),
      solution: t('learnMore.solution2'),
      icon: <Rocket className="h-5 w-5 text-green-500" />,
      description: t('learnMore.problem2_desc')
    },
    {
      problem: t('learnMore.problem3'),
      solution: t('learnMore.solution3'),
      icon: <Bot className="h-5 w-5 text-purple-500" />,
      description: t('learnMore.problem3_desc')
    }
  ];

  return (
    <>
      <PageHeader
        title={t('learnMore.title')}
        description={t('learnMore.description')}
      >
        <LanguageSwitcher />
      </PageHeader>

      {/* Hero Explanation */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/10 rounded-xl border">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3">{t('learnMore.heroTitle')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('learnMore.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary/10 text-primary">{t('learnMore.heroBadge1')}</Badge>
              <Badge className="bg-green-500/10 text-green-600">{t('learnMore.heroBadge2')}</Badge>
              <Badge className="bg-purple-500/10 text-purple-600">{t('learnMore.heroBadge3')}</Badge>
              <Badge className="bg-orange-500/10 text-orange-600">{t('learnMore.heroBadge4')}</Badge>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href="/ikigai">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('learnMore.heroCta')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {t('learnMore.problemSolutionTitle')}
          </CardTitle>
          <CardDescription>
            {t('learnMore.problemSolutionDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {problemSolution.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' :
              index === 1 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' :
              'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
            }`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600 dark:text-red-400 line-through">{t('Problem')}:</span>
                      <span className="font-semibold">{item.problem}</span>
                    </div>
                    <span className="hidden md:block text-muted-foreground">→</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600 dark:text-green-400">{t('Solution')}:</span>
                      <span className="font-semibold text-primary">{item.solution}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* How It Works Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('learnMore.flowTitle')}</CardTitle>
          <CardDescription>{t('learnMore.flowDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {howItWorks.map((step) => (
            <div key={step.step} className="flex flex-col md:flex-row items-start gap-6 p-4 hover:bg-muted/50 rounded-lg transition-colors">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
                {step.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {step.icon}
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {step.keyPoint}
                  </Badge>
                </div>
                <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: step.description }} />
                
                {step.step === 1 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300" dangerouslySetInnerHTML={{ __html: t('learnMore.howItWorksTip1') }} />
                  </div>
                )}
                
                {step.step === 2 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300" dangerouslySetInnerHTML={{ __html: t('learnMore.howItWorksTip2') }} />
                  </div>
                )}
                
                {step.step === 3 && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-800 dark:text-purple-300" dangerouslySetInnerHTML={{ __html: t('learnMore.howItWorksTip3') }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/ikigai">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('learnMore.startWithStep1')}
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('learnMore.featuresTitle')}</CardTitle>
          <CardDescription>{t('learnMore.featuresDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`flex flex-col p-5 rounded-xl border ${feature.color} transition-all hover:shadow-md`}
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex-1">{feature.description}</p>
                <div className="mt-auto pt-3 border-t">
                  <p className="text-xs font-medium text-primary">{feature.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('learnMore.readyToStart')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 border-t" />
            <span className="text-sm text-muted-foreground">{t('learnMore.readyToStart')}</span>
            <div className="flex-1 border-t" />
          </div>
          <div className="flex gap-3 w-full">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/ikigai">
                <Target className="mr-2 h-4 w-4" />
                {t('learnMore.ctaCreateProfile')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/careers">
                <Users className="mr-2 h-4 w-4" />
                {t('learnMore.ctaExploreCareers')}
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Rocket className="mr-2 h-4 w-4" />
                {t('learnMore.ctaViewDashboard')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
