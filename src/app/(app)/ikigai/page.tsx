
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { Ikigai, EducationLevel } from '@/lib/types';
import { Save, AlertCircle, Sparkles, Target, Zap, Heart, Brain } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useState, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const initialIkigai: Ikigai = {
  passions: '',
  skills: '',
  values: '',
  interests: '',
  educationLevel: undefined,
};

export default function IkigaiPage() {
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', initialIkigai);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const completionPercentage = useMemo(() => {
    if (!hasMounted || !ikigai) return 0;
    
    let completed = 0;
    const fields = ['passions', 'skills', 'values', 'interests'];
    
    fields.forEach(field => {
      if (ikigai[field as keyof Ikigai] && (ikigai[field as keyof Ikigai] as string).length > 10) completed++;
    });
    
    if (ikigai.educationLevel) completed++;
    
    return Math.round((completed / 5) * 100);
  }, [ikigai, hasMounted]);

  const isProfileComplete = completionPercentage >= 80;

  const handleSave = () => {
    if (completionPercentage < 50) {
      toast({
        title: t('ikigai.profileIncompleteToast'),
        description: t('ikigai.profileIncompleteToastDesc'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('toasts.profileSavedTitle'),
      description: isProfileComplete 
        ? t('ikigai.bannerCompleteDesc')
        : t('toasts.profileSavedDescription'),
    });

    if (isProfileComplete) {
      setTimeout(() => {
        toast({
          title: t('ikigai.profileCompleteToast'),
          description: t('ikigai.profileCompleteToastDesc'),
          variant: 'default',
        });
      }, 1000);
    }
  };

  const handleInputChange = (field: keyof Ikigai, value: string) => {
    setIkigai(prev => ({ ...prev, [field]: value }));
  };

  const getFieldStatus = (value?: string): 'good' | 'fair' | 'poor' => {
    if (!value || value.length === 0) return 'poor';
    if (value.length < 30) return 'fair';
    return 'good';
  };
  
  const getStatusColor = (status: 'good' | 'fair' | 'poor') => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
    }
  };
  
  const getStatusText = (field: 'passions' | 'skills' | 'values' | 'interests') => {
    const value = ikigai?.[field] || '';
    const count = value.length;
    const status = getFieldStatus(value);
    switch (status) {
      case 'good': return t('ikigai.statusGood', { count });
      case 'fair': return t('ikigai.statusFair', { count });
      case 'poor': return t('ikigai.statusPoor');
    }
  };

  const tips = [
    {
      icon: <Target className="h-4 w-4" />,
      title: t('ikigai.beSpecific'),
      description: t('ikigai.beSpecificDesc')
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: t('ikigai.includeKeywords'),
      description: t('ikigai.includeKeywordsDesc')
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: t('ikigai.thinkAboutValues'),
      description: t('ikigai.thinkAboutValuesDesc')
    },
    {
      icon: <Brain className="h-4 w-4" />,
      title: t('ikigai.careerGoals'),
      description: t('ikigai.careerGoalsDesc')
    }
  ];

  if (!hasMounted) {
    return (
      <>
        <PageHeader
          title={t('ikigai.title')}
          description={t('ikigai.description')}
        />
        
        {/* Banner Skeleton */}
        <div className="mb-6 p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{t('ikigai.profileTitle')}</CardTitle>
                    <CardDescription>
                      {t('ikigai.profileDescription')}
                    </CardDescription>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div className="space-y-2" key={i}>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="min-h-40 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-2 p-3 rounded-lg border">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t('ikigai.tipsTitle')}
                </CardTitle>
                <CardDescription>
                  {t('ikigai.tipsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-start gap-2 mb-1">
                      <Skeleton className="h-4 w-4 mt-0.5" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('ikigai.nextSteps')}</CardTitle>
                <CardDescription>
                  {t('ikigai.nextStepsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <PageHeader
        title={t('ikigai.title')}
        description={t('ikigai.description')}
      />

      {hasMounted && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isProfileComplete 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-start gap-3">
            {isProfileComplete ? (
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                isProfileComplete 
                  ? 'text-green-900 dark:text-green-300' 
                  : 'text-blue-900 dark:text-blue-300'
              }`}>
                {isProfileComplete ? t('ikigai.bannerCompleteTitle') : t('ikigai.bannerIncompleteTitle')}
              </h3>
              <p className={`text-sm mt-1 ${
                isProfileComplete 
                  ? 'text-green-800 dark:text-green-400' 
                  : 'text-blue-800 dark:text-blue-400'
              }`}>
                {isProfileComplete 
                  ? t('ikigai.bannerCompleteDesc')
                  : t('ikigai.bannerIncompleteDesc')}
              </p>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>{t('dashboard.profileCompletion')}</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                {completionPercentage < 80 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {t('ikigai.bannerProgressDesc')}
                  </p>
                )}
              </div>
            </div>
            
            {isProfileComplete && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {t('ikigai.readyForCareers')}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{t('ikigai.profileTitle')}</CardTitle>
                  <CardDescription>
                    {t('ikigai.profileDescription')}
                  </CardDescription>
                </div>
                {hasMounted && (
                  <Badge variant={isProfileComplete ? "default" : "outline"}>
                    {t('ikigai.completion', { completionPercentage })}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passions" className="text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {t('ikigai.passionsLabel')}
                    </Label>
                    {hasMounted && <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai?.passions))}`}>{getStatusText('passions')}</span>}
                  </div>
                  <Textarea
                    id="passions"
                    placeholder={t('ikigai.passionsPlaceholder')}
                    className="min-h-40"
                    value={ikigai?.passions || ''}
                    onChange={(e) => handleInputChange('passions', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('ikigai.passionDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skills" className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {t('ikigai.skillsLabel')}
                    </Label>
                    {hasMounted && <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai?.skills))}`}>{getStatusText('skills')}</span>}
                  </div>
                  <Textarea
                    id="skills"
                    placeholder={t('ikigai.skillsPlaceholder')}
                    className="min-h-40"
                    value={ikigai?.skills || ''}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('ikigai.skillsDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="values" className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      {t('ikigai.valuesLabel')}
                    </Label>
                    {hasMounted && <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai?.values))}`}>{getStatusText('values')}</span>}
                  </div>
                  <Textarea
                    id="values"
                    placeholder={t('ikigai.valuesPlaceholder')}
                    className="min-h-40"
                    value={ikigai?.values || ''}
                    onChange={(e) => handleInputChange('values', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('ikigai.valuesDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interests" className="text-lg flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      {t('ikigai.interestsLabel')}
                    </Label>
                    {hasMounted && <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai?.interests))}`}>{getStatusText('interests')}</span>}
                  </div>
                  <Textarea
                    id="interests"
                    placeholder={t('ikigai.interestsPlaceholder')}
                    className="min-h-40"
                    value={ikigai?.interests || ''}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('ikigai.interestsDesc')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-medium">{t('ikigai.educationLevelTitle')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('ikigai.educationLevelDesc')}
                </p>
                <RadioGroup
                  value={ikigai?.educationLevel}
                  onValueChange={(value) =>
                    setIkigai(prev => ({ ...prev, educationLevel: value as EducationLevel }))
                  }
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    ikigai?.educationLevel === 'highSchool' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="highSchool" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer">🎓 {t('ikigai.highSchool')}</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    ikigai?.educationLevel === 'undergrad' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="undergrad" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer">🏫 {t('ikigai.undergrad')}</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    ikigai?.educationLevel === 'masters' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="masters" id="r3" />
                    <Label htmlFor="r3" className="cursor-pointer">📚 {t('ikigai.masters')}</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    ikigai?.educationLevel === 'phd' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="phd" id="r4" />
                    <Label htmlFor="r4" className="cursor-pointer">🎓 {t('ikigai.phd')}</Label>
                  </div>
                   <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    ikigai?.educationLevel === 'professional' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="professional" id="r5" />
                    <Label htmlFor="r5" className="cursor-pointer">💼 {t('ikigai.professional')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div>
                {hasMounted && (
                  <>
                    {completionPercentage < 50 ? (
                      <p className="text-sm text-yellow-600">
                        ⚠️ {t('ikigai.footerWarning')}
                      </p>
                    ) : completionPercentage < 80 ? (
                      <p className="text-sm text-blue-600">
                        📝 {t('ikigai.footerAlmostThere')}
                      </p>
                    ) : (
                      <p className="text-sm text-green-600">
                        ✅ {t('ikigai.footerReady')}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/careers" className={!isProfileComplete ? "pointer-events-none opacity-50" : ""}>
                       {t('ikigai.skipToCareers')}
                  </Link>
                </Button>
                <Button onClick={handleSave} disabled={!hasMounted || completionPercentage < 30}>
                  <Save className="mr-2 h-4 w-4" /> {t('ikigai.saveButton')}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t('ikigai.tipsTitle')}
              </CardTitle>
              <CardDescription>
                {t('ikigai.tipsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="mt-0.5">{tip.icon}</div>
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              ))}
              
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{t('ikigai.whyItMatters')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('ikigai.whyItMattersDesc')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('ikigai.nextSteps')}</CardTitle>
              <CardDescription>
                {t('ikigai.nextStepsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{t('ikigai.step1')}</p>
                  <p className="text-xs text-muted-foreground">{t('ikigai.step1_desc')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{t('ikigai.step2')}</p>
                  <p className="text-xs text-muted-foreground">{t('ikigai.step2_desc')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{t('ikigai.step3')}</p>
                  <p className="text-xs text-muted-foreground">{t('ikigai.step3_desc')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
               <Button asChild variant="outline" className="w-full" disabled={!isProfileComplete}>
                <Link href="/careers">
                  {isProfileComplete ? t('ikigai.exploreCareersNow') : t('ikigai.completeProfileFirst')}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

    