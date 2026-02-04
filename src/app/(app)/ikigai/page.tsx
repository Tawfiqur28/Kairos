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
import type { Ikigai, EducationLevel } from '@/lib/types';
import { Save } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialIkigai: Ikigai = {
  passions: '',
  skills: '',
  values: '',
  interests: '',
  educationLevel: undefined,
};

export default function IkigaiPage() {
  const [ikigai, setIkigai] = useLocalStorage<Ikigai>('ikigai-profile', initialIkigai);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSave = () => {
    // The useLocalStorage hook already saves on change, but this provides explicit user feedback.
    toast({
      title: t('toasts.profileSavedTitle'),
      description: t('toasts.profileSavedDescription'),
    });
  };

  return (
    <>
      <PageHeader
        title={t('ikigai.title')}
        description={t('ikigai.description')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('ikigai.profileTitle')}</CardTitle>
          <CardDescription>
            {t('ikigai.profileDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passions" className="text-lg">{t('ikigai.passionsLabel')}</Label>
              <Textarea
                id="passions"
                placeholder={t('ikigai.passionsPlaceholder')}
                className="min-h-40"
                value={ikigai.passions}
                onChange={(e) => setIkigai({ ...ikigai, passions: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-lg">{t('ikigai.skillsLabel')}</Label>
              <Textarea
                id="skills"
                placeholder={t('ikigai.skillsPlaceholder')}
                className="min-h-40"
                value={ikigai.skills}
                onChange={(e) => setIkigai({ ...ikigai, skills: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="values" className="text-lg">{t('ikigai.valuesLabel')}</Label>
              <Textarea
                id="values"
                placeholder={t('ikigai.valuesPlaceholder')}
                className="min-h-40"
                value={ikigai.values}
                onChange={(e) => setIkigai({ ...ikigai, values: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests" className="text-lg">{t('ikigai.interestsLabel')}</Label>
              <Textarea
                id="interests"
                placeholder={t('ikigai.interestsPlaceholder')}
                className="min-h-40"
                value={ikigai.interests}
                onChange={(e) => setIkigai({ ...ikigai, interests: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <Label className="text-lg font-medium">Where are you right now?</Label>
            <RadioGroup
              value={ikigai.educationLevel}
              onValueChange={(value) =>
                setIkigai({ ...ikigai, educationLevel: value as EducationLevel })
              }
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="highSchool" id="r1" />
                <Label htmlFor="r1" className="cursor-pointer">🎓 High School Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="undergrad" id="r2" />
                <Label htmlFor="r2" className="cursor-pointer">🏫 Undergraduate Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masters" id="r3" />
                <Label htmlFor="r3" className="cursor-pointer">📚 Master's Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phd" id="r4" />
                <Label htmlFor="r4" className="cursor-pointer">🎓 PhD/Doctoral Candidate</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> {t('ikigai.saveButton')}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
