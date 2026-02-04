'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Briefcase, Target } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.step1_title')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{t('dashboard.step1_card_title')}</div>
            <p className="text-xs text-muted-foreground mb-4">
              {t('dashboard.step1_card_text')}
            </p>
            <Button asChild>
              <Link href="/ikigai">
                {t('dashboard.step1_card_cta')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.step2_title')}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{t('dashboard.step2_card_title')}</div>
            <p className="text-xs text-muted-foreground mb-4">
              {t('dashboard.step2_card_text')}
            </p>
            <Button asChild>
              <Link href="/careers">
                {t('dashboard.step2_card_cta')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.progress_title')}</CardTitle>
            <CardDescription>
              {t('dashboard.progress_text')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress visualization can be added here */}
            <p className="text-sm text-muted-foreground">
              {t('dashboard.progress_subtext')}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
