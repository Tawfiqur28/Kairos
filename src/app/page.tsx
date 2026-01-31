import { AppLogo } from '@/components/app-logo';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, PenSquare, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const ikigaiImage = PlaceHolderImages.find((img) => img.id === 'ikigai');
  const aiMatchImage = PlaceHolderImages.find((img) => img.id === 'ai-match');
  const planImage = PlaceHolderImages.find((img) => img.id === 'action-plan');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <AppLogo />
          <Button asChild>
            <Link href="/dashboard">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="font-headline text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Discover Your Purpose. <br className="hidden sm:inline" />
              Navigate Your Career with AI.
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              Kairos Compass helps you find your professional Ikigai by mapping your passions, skills, and values to fulfilling career paths with a personalized, AI-driven action plan.
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Find Your Path <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {heroImage && (
          <section className="container my-12">
            <div className="overflow-hidden rounded-lg border shadow-lg">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={600}
                className="w-full object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            </div>
          </section>
        )}

        <section id="features" className="container space-y-12 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our application uses a three-step process to guide you from self-discovery to a concrete action plan.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <Target className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">Ikigai Canvas</h3>
                  <p className="text-sm text-muted-foreground">
                    An interactive space to articulate your passions, skills, values, and interests, forming the foundation of your career journey.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <Bot className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">AI-Powered Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your unique profile to suggest careers that align with your Ikigai, complete with a personalized fit score.
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
                    Receive a dynamic, step-by-step 3-year action plan to achieve your career goals, generated just for you.
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
            <p className="text-center text-sm leading-loose md:text-left">
              Built by you. Powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
