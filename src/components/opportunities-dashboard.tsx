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
import { BarChart, BookOpen, Bot, BrainCircuit, GanttChartSquare, Users, Zap, Rocket, AlertCircle, Target, Mic, PenSquare } from 'lucide-react';
import { useMemo } from 'react';

interface OpportunitiesDashboardProps {
  careerTitle: string;
  educationLevel: EducationLevel;
}

export function OpportunitiesDashboard({ careerTitle, educationLevel }: OpportunitiesDashboardProps) {
  const { t } = useLanguage();
  const currentDate = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const educationLevelMap: Record<string, string> = {
    highSchool: t('opportunities.highSchool'),
    undergrad: t('opportunities.undergrad'),
    masters: t('opportunities.masters'),
    phd: t('opportunities.phd'),
    professional: t('ikigai.professional'),
  };

  const displayEducationLevel = educationLevelMap[educationLevel] || educationLevel;
  
  const competitionAccordions = useMemo(() => [
      {
        level: 'highSchool',
        title: t('opportunities.highSchool'),
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{t('opportunities.scienceResearch')}</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>International Science & Engineering Fair (ISEF)</li>
                <li>Google Science Fair</li>
                <li>National Science Bowl</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">{t('opportunities.techCode')}</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>Congressional App Challenge</li>
                <li>FIRST Robotics Competition</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        level: 'undergrad',
        title: t('opportunities.undergrad'),
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{t('opportunities.globalCompetitions')}</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>ACM International Collegiate Programming Contest (ICPC)</li>
                <li>Microsoft Imagine Cup</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">{t('opportunities.researchOpportunities')}</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>NSF REU Programs</li>
                <li>Summer research fellowships</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        level: 'masters',
        title: t('opportunities.masters'),
        content: (
           <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{t('opportunities.thesisAwards')}</h4>
               <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>Conference paper competitions</li>
                <li>Research poster contests</li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold">{t('opportunities.industryBridges')}</h4>
               <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>Startup incubator programs (Y Combinator, Techstars)</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        level: 'phd',
        title: t('opportunities.phd'),
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{t('opportunities.prestigiousAwards')}</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>Dissertation completion fellowships</li>
                <li>Early career researcher awards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">{t('opportunities.innovationCommercialization')}</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                <li>NSF I-Corps program</li>
              </ul>
            </div>
          </div>
        ),
      },
    ], [t]);
    
  const jobAccordions = useMemo(() => [
    {
      level: 'highSchool',
      title: t('opportunities.hsToUndergrad'),
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{t('opportunities.summerPrograms')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Research Science Institute (RSI) at MIT</li>
              <li>NASA internships for high school students</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">{t('opportunities.scholarships')}</h4>
             <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Merit-based scholarships</li>
              <li>Need-based financial aid programs</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      level: 'undergrad',
      title: t('opportunities.undergradToMasters'),
      content: (
        <div className="space-y-4">
           <div>
            <h4 className="font-semibold">{t('opportunities.researchAssistant')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Openings in university labs</li>
              <li>Industry-sponsored research assistantships</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">{t('opportunities.internshipDeadlines')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Summer internship applications</li>
              <li>Co-op program applications</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      level: 'masters',
      title: t('opportunities.mastersToIndustry'),
      content: (
        <div className="space-y-4">
           <div>
            <h4 className="font-semibold">{t('opportunities.entryLevel')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>New grad programs at top companies</li>
              <li>Rotational programs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">{t('opportunities.phdDeadlines')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Fall admissions closing soon</li>
              <li>Fully-funded PhD positions</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      level: 'phd',
      title: t('opportunities.phdToCareer'),
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{t('opportunities.academicPositions')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Tenure-track assistant professor openings</li>
              <li>Postdoctoral fellowship opportunities</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">{t('opportunities.industryResearchRoles')}</h4>
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              <li>Senior research scientist positions</li>
              <li>R&D team lead opportunities</li>
            </ul>
          </div>
        </div>
      )
    }
  ], [t]);


  return (
    <div className="space-y-6 mt-6">
      {/* Monthly Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t('opportunities.monthlyTitle', { careerName: careerTitle })}
          </CardTitle>
          <CardDescription>{t('opportunities.monthlySubtitle', { date: currentDate })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('opportunities.innovationTitle')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <p><strong>{t('opportunities.breakthrough')}:</strong> [Latest breakthrough in the field]</p>
              <p><strong>{t('opportunities.tool')}:</strong> [New software/framework revolutionizing work]</p>
              <p><strong>{t('opportunities.researchHotspot')}:</strong> [University/company making waves]</p>
              <p><strong>{t('opportunities.skillInDemand')}:</strong> [Newly emerged required skill]</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">{t('opportunities.marketPulseTitle')}</h3>
             <div className="grid md:grid-cols-2 gap-4">
                <p><strong>{t('opportunities.jobGrowth')}:</strong> [% increase/decrease this quarter]</p>
                <p><strong>{t('opportunities.salaryTrends')}:</strong> [Current salary ranges]</p>
                <p><strong>{t('opportunities.hiringCompanies')}:</strong> [Companies actively hiring]</p>
                <p><strong>{t('opportunities.geoHotspots')}:</strong> [Best locations for opportunities]</p>
            </div>
          </div>
           <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">{t('opportunities.forYourLevel', { level: displayEducationLevel })}</h3>
            <p className="text-muted-foreground">[Specific advice tailored to your stage]</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Competitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            {t('opportunities.competitionsTitle', { level: displayEducationLevel })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue={educationLevel}>
            {competitionAccordions.map(item => (
              <AccordionItem value={item.level} key={item.level}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Job & Research Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('opportunities.jobsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible defaultValue={educationLevel}>
            {jobAccordions.map(item => (
              <AccordionItem value={item.level} key={item.level}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
