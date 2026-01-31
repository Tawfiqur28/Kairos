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
import type { Ikigai } from '@/lib/types';
import { Save } from 'lucide-react';

const initialIkigai: Ikigai = {
  passions: '',
  skills: '',
  values: '',
  interests: '',
};

export default function IkigaiPage() {
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', initialIkigai);
  const { toast } = useToast();

  const handleSave = () => {
    // The useLocalStorage hook already saves on change, but this provides explicit user feedback.
    toast({
      title: 'Profile Saved!',
      description: 'Your Ikigai profile has been updated.',
    });
  };

  return (
    <>
      <PageHeader
        title="Ikigai Canvas"
        description="This is your space for self-discovery. What drives you?"
      />
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Fill in the four pillars of Ikigai. Be thoughtful and honest with yourself. This information will be used by our AI to find career matches for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passions" className="text-lg">What you LOVE (Passions)</Label>
              <Textarea
                id="passions"
                placeholder="e.g., Solving complex puzzles, creating music, helping others, storytelling..."
                className="min-h-40"
                value={ikigai.passions}
                onChange={(e) => setIkigai({ ...ikigai, passions: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-lg">What you are GOOD AT (Skills)</Label>
              <Textarea
                id="skills"
                placeholder="e.g., Programming in Python, public speaking, graphic design, data analysis..."
                className="min-h-40"
                value={ikigai.skills}
                onChange={(e) => setIkigai({ ...ikigai, skills: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="values" className="text-lg">What the world NEEDS (Values)</Label>
              <Textarea
                id="values"
                placeholder="e.g., Sustainability, accessible education, mental health support, technological innovation..."
                className="min-h-40"
                value={ikigai.values}
                onChange={(e) => setIkigai({ ...ikigai, values: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests" className="text-lg">What you can be PAID FOR (Interests)</Label>
              <Textarea
                id="interests"
                placeholder="e.g., Building software, creating marketing campaigns, providing financial advice, scientific research..."
                className="min-h-40"
                value={ikigai.interests}
                onChange={(e) => setIkigai({ ...ikigai, interests: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Profile
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
