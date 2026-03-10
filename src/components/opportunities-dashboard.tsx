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
import { BarChart, BookOpen, Bot, BrainCircuit, GanttChartSquare, Users, Zap, Rocket, AlertCircle, Target, Mic, PenSquare, Briefcase, TrendingUp, Trophy } from 'lucide-react';
import { useMemo } from 'react';

interface OpportunitiesDashboardProps {
  careerTitle: string;
  educationLevel: EducationLevel;
}

// COMPLETE MAPPING FOR ALL 22 CAREERS
const getIntelligenceKey = (careerTitle: string): 'cloud_cyber' | 'data_ai' | 'education_health' | 'software_design' | 'marketing_creative' => {
  const lowerCaseTitle = careerTitle.toLowerCase();
  
  // ===== TECH CAREERS (7 jobs) =====
  
  // 1. Software Engineer → software_design
  if (lowerCaseTitle.includes('software') || 
      (lowerCaseTitle.includes('engineer') && !lowerCaseTitle.includes('chemical') && !lowerCaseTitle.includes('architect'))) {
    return 'software_design';
  }
  
  // 2. Cloud Architect → cloud_cyber
  if (lowerCaseTitle.includes('cloud') || (lowerCaseTitle.includes('architect') && lowerCaseTitle.includes('cloud'))) {
    return 'cloud_cyber';
  }
  
  // 3. Data Scientist → data_ai
  // 5. AI Researcher → data_ai
  if (lowerCaseTitle.includes('data') || 
      lowerCaseTitle.includes('scientist') ||
      lowerCaseTitle.includes('ai') ||
      lowerCaseTitle.includes('artificial intelligence') ||
      lowerCaseTitle.includes('machine learning') ||
      lowerCaseTitle.includes('researcher')) {
    return 'data_ai';
  }
  
  // 4. Cybersecurity Analyst → cloud_cyber
  // 14. Ethical Hacker → cloud_cyber
  if (lowerCaseTitle.includes('cyber') || 
      lowerCaseTitle.includes('security') ||
      lowerCaseTitle.includes('ethical') ||
      lowerCaseTitle.includes('hacker') ||
      (lowerCaseTitle.includes('analyst') && lowerCaseTitle.includes('security'))) {
    return 'cloud_cyber';
  }
  
  // 13. Metaverse Developer → software_design
  // 19. Blockchain Developer → software_design
  if (lowerCaseTitle.includes('metaverse') || 
      lowerCaseTitle.includes('blockchain') ||
      lowerCaseTitle.includes('web3') ||
      lowerCaseTitle.includes('crypto') ||
      (lowerCaseTitle.includes('developer') && !lowerCaseTitle.includes('software'))) {
    return 'software_design';
  }
  
  // ===== SCIENCE CAREERS (2 jobs) =====
  
  // 6. Physicist → data_ai
  // 7. Chemist → data_ai
  if (lowerCaseTitle.includes('physicist') || 
      lowerCaseTitle.includes('chemist') ||
      lowerCaseTitle.includes('physics') ||
      lowerCaseTitle.includes('chemistry') ||
      (lowerCaseTitle.includes('science') && !lowerCaseTitle.includes('computer'))) {
    return 'data_ai';
  }
  
  // ===== HEALTHCARE CAREERS (2 jobs) =====
  
  // 17. Doctor → education_health
  // 22. Psychologist → education_health
  if (lowerCaseTitle.includes('doctor') || 
      lowerCaseTitle.includes('physician') ||
      lowerCaseTitle.includes('medical') ||
      lowerCaseTitle.includes('psychologist') ||
      lowerCaseTitle.includes('therapist') ||
      lowerCaseTitle.includes('clinical') ||
      lowerCaseTitle.includes('health')) {
    return 'education_health';
  }
  
  // ===== EDUCATION CAREERS (1 job) =====
  
  // 18. Professor → education_health
  if (lowerCaseTitle.includes('professor') || 
      lowerCaseTitle.includes('teacher') ||
      lowerCaseTitle.includes('education') ||
      lowerCaseTitle.includes('faculty') ||
      lowerCaseTitle.includes('academic')) {
    return 'education_health';
  }
  
  // ===== ARCHITECTURE & ENGINEERING (1 job) =====
  
  // 20. Architect → software_design
  if (lowerCaseTitle.includes('architect') && !lowerCaseTitle.includes('software') && !lowerCaseTitle.includes('cloud')) {
    return 'software_design';
  }
  
  // ===== ARTS & CREATIVE CAREERS (5 jobs) =====
  
  // 8. Music Producer → marketing_creative
  // 10. Graphic Designer → marketing_creative
  // 11. UI/UX Designer → marketing_creative
  // 12. TikTok/Content Creator → marketing_creative
  if (lowerCaseTitle.includes('music') || 
      lowerCaseTitle.includes('producer') ||
      lowerCaseTitle.includes('graphic') ||
      lowerCaseTitle.includes('designer') ||
      lowerCaseTitle.includes('ui') ||
      lowerCaseTitle.includes('ux') ||
      lowerCaseTitle.includes('content') ||
      lowerCaseTitle.includes('tiktok') ||
      lowerCaseTitle.includes('creative') ||
      lowerCaseTitle.includes('artist')) {
    return 'marketing_creative';
  }
  
  // ===== BUSINESS & MARKETING CAREERS (3 jobs) =====
  
  // 9. Marketing Manager → marketing_creative
  // 21. Digital Marketing Specialist → marketing_creative
  if (lowerCaseTitle.includes('marketing') || 
      lowerCaseTitle.includes('digital') ||
      lowerCaseTitle.includes('business') ||
      lowerCaseTitle.includes('manager') ||
      lowerCaseTitle.includes('finance') ||
      (lowerCaseTitle.includes('analyst') && !lowerCaseTitle.includes('data') && !lowerCaseTitle.includes('security'))) {
    return 'marketing_creative';
  }
  
  // ===== LAW CAREERS (1 job) =====
  
  // 15. Lawyer → marketing_creative
  if (lowerCaseTitle.includes('law') || 
      lowerCaseTitle.includes('lawyer') ||
      lowerCaseTitle.includes('attorney') ||
      lowerCaseTitle.includes('legal') ||
      lowerCaseTitle.includes('counsel')) {
    return 'marketing_creative';
  }
  
  // ===== SPORTS & ESPORTS CAREERS (1 job) =====
  
  // 16. E-sports Coach → marketing_creative
  if (lowerCaseTitle.includes('sports') || 
      lowerCaseTitle.includes('esports') ||
      lowerCaseTitle.includes('coach') ||
      lowerCaseTitle.includes('gaming') ||
      lowerCaseTitle.includes('tournament')) {
    return 'marketing_creative';
  }
  
  // Default fallback
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

const iconMap: { [key: string]: React.ElementType } = {
  Rocket,
  BrainCircuit,
  Zap,
  Users,
  BarChart,
};

const competitions = [
  {
    titleKey: 'opportunities.competitions.items.0.title',
    descriptionKey: 'opportunities.competitions.items.0.description',
    icon: 'Rocket',
  },
  {
    titleKey: 'opportunities.competitions.items.1.title',
    descriptionKey: 'opportunities.competitions.items.1.description',
    icon: 'BrainCircuit',
  },
  {
    titleKey: 'opportunities.competitions.items.2.title',
    descriptionKey: 'opportunities.competitions.items.2.description',
    icon: 'Zap',
  },
  {
    titleKey: 'opportunities.competitions.items.3.title',
    descriptionKey: 'opportunities.competitions.items.3.description',
    icon: 'Users',
  },
  {
    titleKey: 'opportunities.competitions.items.4.title',
    descriptionKey: 'opportunities.competitions.items.4.description',
    icon: 'BarChart',
  },
];


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

      {/* Competitions & Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t('opportunities.competitions.title')}
          </CardTitle>
          <CardDescription>{t('opportunities.competitions.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {competitions.map((item, index) => {
            const Icon = iconMap[item.icon] || Zap;
            return (
              <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <Icon className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">{t(item.titleKey)}</h4>
                  <p className="text-sm text-muted-foreground">{t(item.descriptionKey)}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Opportunities by Education Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
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
        </CardContent>
      </Card>

    </div>
  );
}