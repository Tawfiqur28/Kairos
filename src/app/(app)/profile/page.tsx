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
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { UserProfile, Ikigai } from '@/lib/types';
import { Camera, Mail, MapPin, X, CheckCircle2, Heart, Zap, Target, Brain, Database, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const initialProfile: UserProfile = {
  name: 'User',
  email: '',
  location: '',
  website: '',
  bio: '',
  ikigai: {
    passions: '',
    skills: '',
    values: '',
    interests: '',
  },
};

const initialIkigai: Ikigai = {
  passions: '',
  skills: '',
  values: '',
  interests: '',
  educationLevel: undefined,
};

const DEFAULT_TERMS = [
  { term: "NumPy", url: "https://en.wikipedia.org/wiki/NumPy", category: "library", description: "Numerical Python library" },
  { term: "Pandas", url: "https://en.wikipedia.org/wiki/Pandas_(software)", category: "library", description: "Data manipulation and analysis library" },
  { term: "TensorFlow", url: "https://en.wikipedia.org/wiki/TensorFlow", category: "library", description: "Machine learning framework" },
  { term: "PyTorch", url: "https://en.wikipedia.org/wiki/PyTorch", category: "library", description: "Open source machine learning library" },
  { term: "Scikit-learn", url: "https://en.wikipedia.org/wiki/Scikit-learn", category: "library", description: "Machine learning library for Python" },
  { term: "Matplotlib", url: "https://en.wikipedia.org/wiki/Matplotlib", category: "library", description: "Plotting library for Python" },
  { term: "Linear Algebra", url: "https://en.wikipedia.org/wiki/Linear_algebra", category: "concept", description: "Branch of mathematics concerning linear equations" },
  { term: "Calculus", url: "https://en.wikipedia.org/wiki/Calculus", category: "concept", description: "Mathematical study of continuous change" },
  { term: "NLP", url: "https://en.wikipedia.org/wiki/Natural_language_processing", category: "technique", description: "Natural Language Processing" },
  { term: "Computer Vision", url: "https://en.wikipedia.org/wiki/Computer_vision", category: "technique", description: "Field dealing with how computers can gain high-level understanding from digital images" },
  { term: "Deep Learning", url: "https://en.wikipedia.org/wiki/Deep_learning", category: "technique", description: "Part of a broader family of machine learning methods based on artificial neural networks" },
  { term: "Machine Learning", url: "https://en.wikipedia.org/wiki/Machine_learning", category: "technique", description: "Study of computer algorithms that improve automatically through experience" },
  { term: "Neural Networks", url: "https://en.wikipedia.org/wiki/Artificial_neural_network", category: "technique", description: "Computing systems inspired by biological neural networks" },
  { term: "Git", url: "https://en.wikipedia.org/wiki/Git", category: "tool", description: "Software for tracking changes in any set of files" },
  { term: "GitHub", url: "https://en.wikipedia.org/wiki/GitHub", category: "tool", description: "Provider of Internet hosting for software development" },
  { term: "Docker", url: "https://en.wikipedia.org/wiki/Docker_(software)", category: "tool", description: "Set of platform as a service products that use OS-level virtualization" }
];

export default function ProfilePage() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('user-profile', initialProfile);
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', initialIkigai);
  const [hasMounted, setHasMounted] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSeedTerms = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      for (const term of DEFAULT_TERMS) {
        const termId = term.term.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(firestore, 'technicalTerms', termId), {
          ...term,
          id: termId,
          popularity: 90
        });
      }
      toast({ title: "Dictionary Seeded", description: "Technical terms have been added to your database." });
    } catch (error) {
      console.error("Seeding error:", error);
      toast({ title: "Seeding Failed", description: "Could not update the technical terms dictionary.", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfile({ ...profile, image: undefined });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!hasMounted) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <div
                  className="relative cursor-pointer group"
                  onClick={triggerFileInput}
                >
                  <Avatar className="h-20 w-20 border-2 border-primary/20 overflow-hidden">
                    <AvatarImage src={profile.image || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                
                {profile.image && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{t('profile.cardTitle', { name: profile.name })}</CardTitle>
                    <CardDescription>{t('profile.cardDescription')}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold bg-muted/50 px-2 py-1 rounded">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {t('profile.autoSaved')}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-7" 
                      onClick={handleSeedTerms}
                      disabled={isSeeding}
                    >
                      {isSeeding ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Database className="h-3 w-3 mr-1" />}
                      Seed Wiki Dictionary
                    </Button>
                  </div>
                </div>
                
                {(profile.email || profile.location) && (
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {profile.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">{t('profile.personalInfo')}</TabsTrigger>
                <TabsTrigger value="ikigai">{t('profile.ikigaiProfile')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('profile.nameLabel')}</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder={t('profile.namePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder={t('profile.emailPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('profile.locationLabel')}</Label>
                    <Input
                      id="location"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder={t('profile.locationPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">{t('profile.websiteLabel')}</Label>
                    <Input
                      id="website"
                      value={profile.website || ''}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder={t('profile.websitePlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bioLabel')}</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder={t('profile.bioPlaceholder')}
                    className="min-h-24"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="ikigai" className="space-y-6 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passions" className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {t('profile.passionsLabel')}
                    </Label>
                    <Textarea
                      id="passions"
                      value={ikigai.passions}
                      onChange={(e) => setIkigai({ ...ikigai, passions: e.target.value })}
                      placeholder={t('profile.passionsPlaceholder')}
                      className="min-h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {t('profile.skillsLabel')}
                    </Label>
                    <Textarea
                      id="skills"
                      value={ikigai.skills}
                      onChange={(e) => setIkigai({ ...ikigai, skills: e.target.value })}
                      placeholder={t('profile.skillsPlaceholder')}
                      className="min-h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="values" className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      {t('profile.valuesLabel')}
                    </Label>
                    <Textarea
                      id="values"
                      value={ikigai.values}
                      onChange={(e) => setIkigai({ ...ikigai, values: e.target.value })}
                      placeholder={t('profile.valuesPlaceholder')}
                      className="min-h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests" className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      {t('profile.interestsLabel')}
                    </Label>
                    <Textarea
                      id="interests"
                      value={ikigai.interests}
                      onChange={(e) => setIkigai({ ...ikigai, interests: e.target.value })}
                      placeholder={t('profile.interestsPlaceholder')}
                      className="min-h-32"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('profile.accountStats')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {ikigai.passions ? '✓' : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.passionsLabel')}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {ikigai.skills ? '✓' : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.skillsLabel')}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {ikigai.values ? '✓' : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.valuesLabel')}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {ikigai.interests ? '✓' : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.interestsLabel')}</div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t pt-6">
            <div className="text-sm text-muted-foreground">
              {profile.email && (
                <Badge variant="outline" className="mr-2">
                  {t('profile.verified')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {t('profile.autoSaved')}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
