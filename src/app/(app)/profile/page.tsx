
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
import { Camera, Mail, MapPin, X, CheckCircle2, Heart, Zap, Target, Brain } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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

export default function ProfilePage() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('user-profile', initialProfile);
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', initialIkigai);
  const [hasMounted, setHasMounted] = useState(false);
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
      />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative cursor-pointer group"
                  onClick={triggerFileInput}
                >
                  <Avatar className="h-20 w-20 border-2 border-primary/20 overflow-hidden">
                    <AvatarImage src={profile.image || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {hasMounted ? getInitials(profile.name) : 'U'}
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
                </motion.div>
                
                {profile.image && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    title="Remove Photo"
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
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold bg-muted/50 px-2 py-1 rounded">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {t('profile.autoSaved')}
                  </div>
                </div>
                
                {hasMounted && (profile.email || profile.location) && (
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
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
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
                </motion.div>
                
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bioLabel')}</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder={t('profile.bioPlaceholder')}
                    className="min-h-24"
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="ikigai" className="space-y-6 pt-4">
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
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
                </motion.div>
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold">{t('profile.accountStats')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {hasMounted ? (ikigai.passions ? '✓' : '—') : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.passionsLabel')}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {hasMounted ? (ikigai.skills ? '✓' : '—') : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.skillsLabel')}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {hasMounted ? (ikigai.values ? '✓' : '—') : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.valuesLabel')}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {hasMounted ? (ikigai.interests ? '✓' : '—') : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profile.interestsLabel')}</div>
                </div>
              </div>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t pt-6">
            <div className="text-sm text-muted-foreground">
              {hasMounted && profile.email && (
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
    </>
  );
}
