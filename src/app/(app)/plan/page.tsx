'use client';

import { generatePersonalizedActionPlan } from '@/ai/flows/generate-personalized-action-plan';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { Ikigai } from '@/lib/types';
import careerData from '@/lib/careers.json';
import { Loader2, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

function PlanGenerator() {
  const searchParams = useSearchParams();
  const careerId = searchParams.get('career');
  const career = careerData.careers.find((c) => c.id === careerId);

  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  });

  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    if (!career) {
      toast({
        title: 'No Career Selected',
        description: 'Please select a career from the careers page first.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setActionPlan(null);
    try {
      const userDetails = `The user is an undergraduate student. Their profile is as follows - Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}.`;
      
      const result = await generatePersonalizedActionPlan({
        careerGoal: career.title,
        userDetails: userDetails,
      });

      // Specific instruction handling from user request
      if (career.id === 'software-engineer' || career.id === "cloud-architect" || career.id === "cyber-security-analyst") {
        const specificPlan = `Given your interest in ${career.title} as an undergraduate student, here is a more specific plan:\n\n**Year 1: Foundational Skills**\n- **Major Declaration:** Declare your major in Computer Science. If not possible, a related field like Information Technology or Software Engineering is also a great choice.\n- **Core Courses:** Excel in your introductory courses: Intro to Programming (Python/Java), Data Structures, and Discrete Mathematics.\n- **Personal Projects:** Start a small project on GitHub. A simple command-line tool, a personal website, or a basic mobile app are great starting points.\n- **Networking:** Join your university's coding club or ACM chapter. Attend at least two tech meetups or university career fairs.\n\n**Year 2: Specialization & Experience**\n- **Advanced Courses:** Take courses related to your area of interest. For **Software Engineering**, focus on Software Design Patterns and Operating Systems. For **Cloud Computing**, take courses on Networks and Databases. For **Cyber Security**, look for introductions to cryptography and network security.\n- **First Internship:** Secure a summer internship. It doesn't have to be at a top company; a local startup or even a university IT department role provides valuable experience.\n- **Certifications:** Begin studying for an entry-level certification. For Cloud, consider AWS Certified Cloud Practitioner. For Cyber Security, CompTIA Security+.\n- **Hackathons:** Participate in at least one hackathon to build something cool and practice teamwork under pressure.\n\n**Year 3: Mastery & Launch**\n- **Master's Preparation:** Research Master's programs. For a **Software Engineering** path, a Master's in Software Engineering or CS is ideal. For **Cloud**, look for Cloud Computing specializations. For **Cyber Security**, a focused Master's in Cybersecurity is best. Start preparing for the GRE if required.\n- **Advanced Internship/Project:** Secure a more advanced internship or contribute to a significant open-source project. This will be a major highlight on your resume and grad school applications.\n- **Portfolio Refinement:** Polish your portfolio website, ensuring your top 2-3 projects are well-documented with clear descriptions and code samples.\n- **Full-time/Grad School Applications:** Begin applying for full-time jobs and Master's programs in the fall semester. Leverage your university's career services for resume reviews and mock interviews.\n\n${result.actionPlan}`;
        setActionPlan(specificPlan);
      } else {
        setActionPlan(result.actionPlan);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: 'Could not generate an action plan at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically generate plan on page load if a career is selected
    if (career) {
      handleGeneratePlan();
    }
  }, [career]);


  if (!career) {
    return (
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Career Selected</AlertTitle>
            <AlertDescription>
                Please go to the "Careers" page and get an AI match to generate a plan.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your 3-Year Action Plan: {career.title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-headline">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">AI is crafting your personalized plan...</p>
          </div>
        )}
        {actionPlan && <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">{actionPlan}</div>}
        {!actionPlan && !isLoading && (
            <div className="text-center p-8">
                <p className="mb-4">Click the button to generate your personalized action plan.</p>
                <Button onClick={handleGeneratePlan} disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function PlanPage() {
    return (
        <>
        <PageHeader
            title="Your Action Plan"
            description="A personalized, step-by-step guide to help you achieve your career goals."
        />
        <Suspense fallback={<div>Loading...</div>}>
            <PlanGenerator />
        </Suspense>
        </>
    )
}
