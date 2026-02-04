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
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
  const [characterCounts, setCharacterCounts] = useState({
    passions: 0,
    skills: 0,
    values: 0,
    interests: 0,
  });

  useEffect(() => {
    setHasMounted(true);
    // Calculate character counts
    setCharacterCounts({
      passions: ikigai.passions.length,
      skills: ikigai.skills.length,
      values: ikigai.values.length,
      interests: ikigai.interests.length,
    });
  }, [ikigai]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!hasMounted) return 0;
    
    let completed = 0;
    const fields = ['passions', 'skills', 'values', 'interests'];
    
    fields.forEach(field => {
      if (ikigai[field as keyof Ikigai] && ikigai[field as keyof Ikigai].length > 10) completed++;
    });
    
    // Add education level if selected
    if (ikigai.educationLevel) completed++;
    
    return Math.round((completed / 5) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isProfileComplete = completionPercentage >= 80;

  const handleSave = () => {
    // Validate profile completeness
    if (completionPercentage < 50) {
      toast({
        title: 'Profile Incomplete',
        description: 'Please fill in more details for better career matching.',
        variant: 'destructive',
      });
      return;
    }

    // The useLocalStorage hook already saves on change, but this provides explicit user feedback.
    toast({
      title: t('toasts.profileSavedTitle'),
      description: isProfileComplete 
        ? 'Your profile is complete! You can now explore careers with accurate matching.' 
        : t('toasts.profileSavedDescription'),
    });

    // If profile just became complete, show success message
    if (isProfileComplete && completionPercentage >= 80) {
      setTimeout(() => {
        toast({
          title: '🎉 Profile Complete!',
          description: 'You can now explore careers with personalized matching scores.',
          variant: 'default',
        });
      }, 1000);
    }
  };

  const handleInputChange = (field: keyof Ikigai, value: string) => {
    setIkigai({ ...ikigai, [field]: value });
    setCharacterCounts(prev => ({ ...prev, [field]: value.length }));
  };

  const getFieldStatus = (value: string): 'good' | 'fair' | 'poor' => {
    if (value.length === 0) return 'poor';
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

  const getStatusText = (status: 'good' | 'fair' | 'poor', count: number) => {
    switch (status) {
      case 'good': return `${count} characters - Good detail`;
      case 'fair': return `${count} characters - Add more details`;
      case 'poor': return 'Please provide more information';
    }
  };

  // Tips for better career matching
  const tips = [
    {
      icon: <Target className="h-4 w-4" />,
      title: 'Be Specific',
      description: 'Instead of "I like computers", say "I enjoy building web applications with React and Node.js"'
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: 'Include Keywords',
      description: 'Mention specific skills, tools, and technologies you know or want to learn'
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: 'Think About Values',
      description: 'What matters most to you? Work-life balance, impact, creativity, stability?'
    },
    {
      icon: <Brain className="h-4 w-4" />,
      title: 'Career Goals',
      description: 'Mention any specific career paths or industries you\'re curious about'
    }
  ];

  return (
    <>
      <PageHeader
        title={t('ikigai.title')}
        description={t('ikigai.description')}
      />

      {/* Completion Status Banner */}
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
                {isProfileComplete ? 'Profile Complete!' : 'Complete Your Profile for Better Results'}
              </h3>
              <p className={`text-sm mt-1 ${
                isProfileComplete 
                  ? 'text-green-800 dark:text-green-400' 
                  : 'text-blue-800 dark:text-blue-400'
              }`}>
                {isProfileComplete 
                  ? 'Your detailed profile ensures accurate career matching. Scores will be based on your unique profile.' 
                  : 'A complete profile prevents generic 50% scores and ensures personalized career matching.'}
              </p>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Profile Completion</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                {completionPercentage < 80 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    Fill all sections with detailed information to unlock accurate career matching.
                  </p>
                )}
              </div>
            </div>
            
            {isProfileComplete && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Ready for Careers
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
                    {completionPercentage}% Complete
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Passions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passions" className="text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {t('ikigai.passionsLabel')}
                    </Label>
                    <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai.passions))}`}>
                      {getStatusText(getFieldStatus(ikigai.passions), characterCounts.passions)}
                    </span>
                  </div>
                  <Textarea
                    id="passions"
                    placeholder={t('ikigai.passionsPlaceholder')}
                    className="min-h-40"
                    value={ikigai.passions}
                    onChange={(e) => handleInputChange('passions', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    What excites you? What would you do even if you weren't paid?
                  </p>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skills" className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {t('ikigai.skillsLabel')}
                    </Label>
                    <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai.skills))}`}>
                      {getStatusText(getFieldStatus(ikigai.skills), characterCounts.skills)}
                    </span>
                  </div>
                  <Textarea
                    id="skills"
                    placeholder={t('ikigai.skillsPlaceholder')}
                    className="min-h-40"
                    value={ikigai.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Technical abilities, soft skills, languages, tools, certifications
                  </p>
                </div>

                {/* Values */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="values" className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      {t('ikigai.valuesLabel')}
                    </Label>
                    <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai.values))}`}>
                      {getStatusText(getFieldStatus(ikigai.values), characterCounts.values)}
                    </span>
                  </div>
                  <Textarea
                    id="values"
                    placeholder={t('ikigai.valuesPlaceholder')}
                    className="min-h-40"
                    value={ikigai.values}
                    onChange={(e) => handleInputChange('values', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    What principles guide your decisions? What matters most in a workplace?
                  </p>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interests" className="text-lg flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      {t('ikigai.interestsLabel')}
                    </Label>
                    <span className={`text-xs ${getStatusColor(getFieldStatus(ikigai.interests))}`}>
                      {getStatusText(getFieldStatus(ikigai.interests), characterCounts.interests)}
                    </span>
                  </div>
                  <Textarea
                    id="interests"
                    placeholder={t('ikigai.interestsPlaceholder')}
                    className="min-h-40"
                    value={ikigai.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Topics you enjoy learning about, industries you follow, hobbies
                  </p>
                </div>
              </div>

              {/* Education Level */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-medium">Where are you right now?</Label>
                <p className="text-sm text-muted-foreground">
                  This helps tailor career recommendations and action plans to your current stage.
                </p>
                <RadioGroup
                  value={hasMounted ? ikigai.educationLevel : undefined}
                  onValueChange={(value) =>
                    setIkigai({ ...ikigai, educationLevel: value as EducationLevel })
                  }
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    hasMounted && ikigai.educationLevel === 'highSchool' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="highSchool" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer">🎓 High School Student</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    hasMounted && ikigai.educationLevel === 'undergrad' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="undergrad" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer">🏫 Undergraduate Student</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    hasMounted && ikigai.educationLevel === 'masters' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="masters" id="r3" />
                    <Label htmlFor="r3" className="cursor-pointer">📚 Master's Student</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    hasMounted && ikigai.educationLevel === 'phd' ? 'bg-primary/5 border-primary' : ''
                  }`}>
                    <RadioGroupItem value="phd" id="r4" />
                    <Label htmlFor="r4" className="cursor-pointer">🎓 PhD/Doctoral Candidate</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div>
                {completionPercentage < 50 ? (
                  <p className="text-sm text-yellow-600">
                    ⚠️ More details needed for accurate career matching
                  </p>
                ) : completionPercentage < 80 ? (
                  <p className="text-sm text-blue-600">
                    📝 Almost there! Add more details for the best results
                  </p>
                ) : (
                  <p className="text-sm text-green-600">
                    ✅ Ready for personalized career exploration
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/careers" disabled={!isProfileComplete}>
                    Skip to Careers
                  </Link>
                </Button>
                <Button onClick={handleSave} disabled={completionPercentage < 30}>
                  <Save className="mr-2 h-4 w-4" /> {t('ikigai.saveButton')}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tips for Better Results
              </CardTitle>
              <CardDescription>
                Improve career matching accuracy
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
                <h4 className="font-medium text-sm mb-1">Why This Matters</h4>
                <p className="text-xs text-muted-foreground">
                  Detailed profiles prevent generic 50% scores. The AI analyzes your unique combination to provide accurate career matches and personalized action plans.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                What happens after you save?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Theme Extraction</p>
                  <p className="text-xs text-muted-foreground">AI identifies your key themes (Tech, Science, Arts, etc.)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Career Matching</p>
                  <p className="text-xs text-muted-foreground">Dynamic scores based on your profile, not fixed percentages</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Action Plans</p>
                  <p className="text-xs text-muted-foreground">Personalized 3-phase plans with specific tasks</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full" disabled={!isProfileComplete}>
                <Link href="/careers">
                  {isProfileComplete ? 'Explore Careers Now' : 'Complete Profile First'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
