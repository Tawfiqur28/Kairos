'use client';

import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { UserProfile } from '@/lib/types';
import { Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const initialProfile: UserProfile = {
  name: 'User',
  ikigai: {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('user-profile', initialProfile);
  const [ikigai, setIkigai] = useLocalStorage('ikigai-profile', initialProfile.ikigai);
  const { toast } = useToast();

  const handleSave = () => {
    // The useLocalStorage hook already saves on change, but this provides explicit user feedback.
    setProfile({ ...profile, ikigai: ikigai });
    toast({
      title: 'Profile Saved!',
      description: 'Your profile has been successfully updated.',
    });
  };

  return (
    <>
      <PageHeader
        title="Your Profile"
        description="Manage your account information and Ikigai."
      />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>@{profile.name}</CardTitle>
              <CardDescription>Update your personal details and Ikigai below.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passions">Passions</Label>
              <Textarea
                id="passions"
                value={ikigai.passions}
                onChange={(e) => setIkigai({ ...ikigai, passions: e.target.value })}
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                value={ikigai.skills}
                onChange={(e) => setIkigai({ ...ikigai, skills: e.target.value })}
                className="min-h-32"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
