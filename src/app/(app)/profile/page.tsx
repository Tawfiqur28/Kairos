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
import { Save, Camera, Mail, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { useState, useEffect } from 'react';
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

export default function ProfilePage() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('user-profile', initialProfile);
  const [ikigai, setIkigai] = useLocalStorage('ikigai-profile', initialProfile.ikigai);
  const [hasMounted, setHasMounted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSave = () => {
    // The useLocalStorage hook already saves on change, but this provides explicit user feedback.
    setProfile({ ...profile, ikigai: ikigai });
    toast({
      title: t('toasts.profileSavedTitle'),
      description: t('toasts.profileChangesSavedDescription'),
    });
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
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative"
              >
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {hasMounted ? getInitials(profile.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <div className="flex-1">
                <CardTitle className="text-2xl">{t('profile.cardTitle', { name: profile.name })}</CardTitle>
                <CardDescription>{t('profile.cardDescription')}</CardDescription>
                
                {hasMounted && profile.email && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{profile.email}</span>
                    </div>
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
                      <span className="text-lg">❤️</span>
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
                      <span className="text-lg">⚡</span>
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
                      <span className="text-lg">🎯</span>
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
                      <span className="text-lg">🧠</span>
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={handleSave} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {t('profile.saveButton')}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}