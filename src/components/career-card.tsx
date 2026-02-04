'use client';

import React from 'react';
import type { Career } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface CareerCardProps {
  career: Career;
  matchesTheme: boolean;
  onCheckFit: (career: Career) => void;
  isProfileComplete: boolean;
}

const CareerCard: React.FC<CareerCardProps> = ({ career, matchesTheme, onCheckFit, isProfileComplete }) => {
  const { t } = useLanguage();

  return (
    <Card className={matchesTheme ? 'border-primary/30 bg-primary/5' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{career.title}</CardTitle>
          {matchesTheme && (
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
              {t('careers.matchesYourProfile')}
            </span>
          )}
        </div>
        <CardDescription>{career.description}</CardDescription>
        <div className="text-xs text-muted-foreground">
          {t('careers.cluster', { cluster: career.cluster })}
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-semibold mb-2">{t('careers.keySkills')}</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          {career.requiredSkills.slice(0, 3).map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
          {career.requiredSkills.length > 3 && (
            <li className="text-primary">+{career.requiredSkills.length - 3} more</li>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onCheckFit(career)} 
          disabled={!isProfileComplete}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t('careers.checkFit')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default React.memo(CareerCard);
