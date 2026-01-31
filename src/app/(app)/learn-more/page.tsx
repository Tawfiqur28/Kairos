'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  BrainCircuit,
  PenSquare,
  Mic,
  Target,
} from 'lucide-react';

export default function LearnMorePage() {
  return (
    <>
      <PageHeader
        title="How Kairos Compass Works"
        description="Your automated guide to a fulfilling career path."
      />

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>A Simple, Powerful Flow</CardTitle>
            <CardDescription>We guide you from self-discovery to a concrete action plan in three simple steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
                  <div>
                      <h4 className="font-semibold">Discover Yourself</h4>
                      <p className="text-muted-foreground">
                          Start with our interactive <strong>Ikigai Canvas</strong>. It's a space for you to articulate what you love, what you're good at, what the world needs, and what you can be paid for. This creates a unique profile that powers our AI.
                      </p>
                  </div>
              </div>
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
                  <div>
                      <h4 className="font-semibold">Get AI-Matched Careers</h4>
                      <p className="text-muted-foreground">
                        Our AI analyzes your Ikigai profile and suggests careers that truly align with you. You'll see a personalized "fit score" and a detailed explanation for each match.
                      </p>
                  </div>
              </div>
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
                  <div>
                      <h4 className="font-semibold">Receive a Dynamic Action Plan</h4>
                      <p className="text-muted-foreground">
                        Once you pick a career, our AI generates a specific, step-by-step 3-year plan to help you achieve it. No more guesswork—just a clear path forward.
                      </p>
                  </div>
              </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Core Features & Automation</CardTitle>
                <CardDescription>We use smart technology to make your career planning journey seamless.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                    <Target className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">Ikigai Canvas</h4>
                        <p className="text-sm text-muted-foreground">An interactive canvas to input your passions, skills, values, and interests.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Mic className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">Voice and Text Input</h4>
                        <p className="text-sm text-muted-foreground">Use voice commands or text to interact with the app and fill out your journal entries.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Bot className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">AI Career Match</h4>
                        <p className="text-sm text-muted-foreground">Our AI analyzes your profile to match you with careers from our curated database.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <PenSquare className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">Dynamic 3-Year Plan</h4>
                        <p className="text-sm text-muted-foreground">Get a specific, actionable plan tailored to your chosen career goal.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <BrainCircuit className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">Smart Automation</h4>
                        <p className="text-sm text-muted-foreground">The app learns from your inputs, like journal entries, to refine suggestions over time and prefills information to save you time.</p>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </>
  );
}
