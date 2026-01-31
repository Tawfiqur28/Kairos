
import { AppLogo } from '@/components/app-logo';
import { IkigaiDiagram } from '@/components/ikigai-diagram';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, PenSquare, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <AppLogo />
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-12 pb-8 pt-6 md:grid-cols-2 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-4">
            <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.1]">
              Find Your <span className="text-primary">Perfect</span>
              <br className="hidden sm:inline" />
              <span className="text-accent">Career</span> Path
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              KAIROS uses the ancient Japanese concept of Ikigai and AI to match
              you with careers that align with your passions, skills, and the
              world's needs.
            </p>
            <div className="mt-2 grid gap-3 text-left">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Interactive Quiz</span>
              </div>
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  AI-Powered Matching
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Personalized Plans</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn-more">Learn About Ikigai</Link>
              </Button>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <IkigaiDiagram className="w-full h-auto" />
          </div>
        </section>

        <section
          id="features"
          className="container space-y-12 py-8 md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our application uses a three-step process to guide you from
              self-discovery to a concrete action plan.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <Target className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">Ikigai Canvas</h3>
                  <p className="text-sm text-muted-foreground">
                    An interactive space to articulate your passions, skills,
                    values, and interests, forming the foundation of your career
                    journey.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <Bot className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">
                    AI-Powered Matching
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your unique profile to suggest careers that
                    align with your Ikigai, complete with a personalized fit
                    score.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <PenSquare className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">Personalized Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive a dynamic, step-by-step 3-year action plan to
                    achieve your career goals, generated just for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="container">
        <div className="flex flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo />
          </div>
        </div>
      </footer>
    </div>
  );
}
