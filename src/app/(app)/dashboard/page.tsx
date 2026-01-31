import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Briefcase, Target } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome to Your Journey"
        description="Your path to a fulfilling career starts here."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Step 1: Self-Discovery
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">Ikigai Canvas</div>
            <p className="text-xs text-muted-foreground mb-4">
              Define your passions, skills, values, and interests.
            </p>
            <Button asChild>
              <Link href="/ikigai">
                Start Discovery <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Step 2: Exploration
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">Career Explorer</div>
            <p className="text-xs text-muted-foreground mb-4">
              See AI-matched careers that align with your profile.
            </p>
            <Button asChild>
              <Link href="/careers">
                Explore Careers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              Complete the steps to unlock your personalized action plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress visualization can be added here */}
            <p className="text-sm text-muted-foreground">
              Your journey is just beginning. Let's build a future you love.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
