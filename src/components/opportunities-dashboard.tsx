'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import type { EducationLevel } from '@/lib/types';
import { BarChart, BookOpen, Bot, BrainCircuit, GanttChartSquare, Users, Zap, Rocket, AlertCircle, Target, Mic, PenSquare, Briefcase, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface OpportunitiesDashboardProps {
  careerTitle: string;
  educationLevel: EducationLevel;
}

const getIntelligenceKey = (careerTitle: string): 'cloud_cyber' | 'data_ai' | 'education_health' | 'software_design' | 'marketing_creative' => {
  const lowerCaseTitle = careerTitle.toLowerCase();
  if (lowerCaseTitle.includes('cloud') || lowerCaseTitle.includes('cyber')) {
    return 'cloud_cyber';
  }
  if (lowerCaseTitle.includes('data') || lowerCaseTitle.includes('research scientist')) {
    return 'data_ai';
  }
  if (lowerCaseTitle.includes('teacher') || lowerCaseTitle.includes('nurse')) {
    return 'education_health';
  }
  if (lowerCaseTitle.includes('software') || lowerCaseTitle.includes('ux designer')) {
    return 'software_design';
  }
  if (lowerCaseTitle.includes('marketing') || lowerCaseTitle.includes('music')) {
    return 'marketing_creative';
  }
  // A sensible default if no match.
  return 'software_design';
};

const EducationSection = ({ title, points }: { title: string; points: { title: string; text: string }[] }) => (
    <div className="mt-4">
        <h3 className="font-semibold text-lg mb-3 border-b pb-2">{title}</h3>
        <div className="space-y-3">
        {points.map((point, index) => (
            <div key={index}>
            <p className="font-medium text-primary">{point.title}</p>
            <p className="text-sm text-muted-foreground"  dangerouslySetInnerHTML={{ __html: point.text }} />
            </div>
        ))}
        </div>
    </div>
);


export function OpportunitiesDashboard({ careerTitle, educationLevel }: OpportunitiesDashboardProps) {
  const { t } = useLanguage();
  const currentDate = new Date().toLocaleString(t('langCode'), { month: 'long', year: 'numeric' });
  const intelligenceKey = getIntelligenceKey(careerTitle);

  const getVisibleEducationLevels = useMemo(() => {
    switch (educationLevel) {
      case 'undergrad':
        return ['undergrad', 'masters_phd'];
      case 'masters':
      case 'phd':
        return ['masters_phd'];
      case 'highSchool':
      default:
        return ['highSchool', 'undergrad', 'masters_phd'];
    }
  }, [educationLevel]);
  
  const educationSections = {
      highSchool: {
        title: t('opportunities.education.highSchool.title'),
        points: [
          { title: t('opportunities.education.highSchool.fundamentals_title'), text: t('opportunities.education.highSchool.fundamentals_text') },
          { title: t('opportunities.education.highSchool.exploration_title'), text: t('opportunities.education.highSchool.exploration_text') },
          { title: t('opportunities.education.highSchool.handsOn_title'), text: t('opportunities.education.highSchool.handsOn_text') },
        ],
      },
      undergrad: {
        title: t('opportunities.education.undergrad.title'),
        points: [
          { title: t('opportunities.education.undergrad.specialize_title'), text: t('opportunities.education.undergrad.specialize_text') },
          { title: t('opportunities.education.undergrad.competitions_title'), text: t('opportunities.education.undergrad.competitions_text') },
          { title: t('opportunities.education.undergrad.internship_title'), text: t('opportunities.education.undergrad.internship_text') },
          { title: t('opportunities.education.undergrad.studies_title'), text: t('opportunities.education.undergrad.studies_text') },
        ],
      },
      masters_phd: {
        title: t('opportunities.education.masters_phd.title'),
        points: [
          { title: t('opportunities.education.masters_phd.research_title'), text: t('opportunities.education.masters_phd.research_text') },
          { title: t('opportunities.education.masters_phd.collaboration_title'), text: t('opportunities.education.masters_phd.collaboration_text') },
          { title: t('opportunities.education.masters_phd.global_title'), text: t('opportunities.education.masters_phd.global_text') },
          { title: t('opportunities.education.masters_phd.employment_title'), text: t('opportunities.education.masters_phd.employment_text') },
        ],
      },
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Monthly Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t(`opportunities.intelligence.${intelligenceKey}.title`)}
          </CardTitle>
          <CardDescription>{t('opportunities.monthlySubtitle', { date: currentDate })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Innovation Spotlight */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                {t(`opportunities.intelligence.${intelligenceKey}.innovation_title`)}
            </h3>
             <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {t(`opportunities.intelligence.${intelligenceKey}.innovation_text`)}
            </p>
          </div>
          
          {/* Market Pulse */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t(`opportunities.intelligence.${intelligenceKey}.market_title`)}
            </h3>
             <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {t(`opportunities.intelligence.${intelligenceKey}.market_text`)}
            </p>
          </div>

        </CardContent>
      </Card>
      
      {/* Opportunities by Education Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t('opportunities.education.title')}
          </CardTitle>
           <CardDescription>{t('opportunities.education.description')}</CardDescription>
        </CardHeader>
        <CardContent>
            {getVisibleEducationLevels.includes('highSchool') && (
                <EducationSection title={educationSections.highSchool.title} points={educationSections.highSchool.points} />
            )}
            {getVisibleEducationLevels.includes('undergrad') && (
                <EducationSection title={educationSections.undergrad.title} points={educationSections.undergrad.points} />
            )}
            {getVisibleEducationLevels.includes('masters_phd') && (
                 <EducationSection title={educationSections.masters_phd.title} points={educationSections.masters_phd.points} />
            )}

            <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">{t('opportunities.coreAdvice.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('opportunities.coreAdvice.text')}</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
