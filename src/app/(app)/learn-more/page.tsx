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
import { useLanguage } from '@/context/language-context';

export default function LearnMorePage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title={t('learnMore.title')}
        description={t('learnMore.description')}
      />

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('learnMore.flowTitle')}</CardTitle>
            <CardDescription>{t('learnMore.flowDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
                  <div>
                      <h4 className="font-semibold">{t('learnMore.step1_title')}</h4>
                      <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('learnMore.step1_text') }} />
                  </div>
              </div>
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
                  <div>
                      <h4 className="font-semibold">{t('learnMore.step2_title')}</h4>
                      <p className="text-muted-foreground">
                        {t('learnMore.step2_text')}
                      </p>
                  </div>
              </div>
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
                  <div>
                      <h4 className="font-semibold">{t('learnMore.step3_title')}</h4>
                      <p className="text-muted-foreground">
                        {t('learnMore.step3_text')}
                      </p>
                  </div>
              </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('learnMore.featuresTitle')}</CardTitle>
                <CardDescription>{t('learnMore.featuresDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                    <Target className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">{t('learnMore.feature1_title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('learnMore.feature1_text')}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Mic className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">{t('learnMore.feature2_title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('learnMore.feature2_text')}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Bot className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">{t('learnMore.feature3_title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('learnMore.feature3_text')}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <PenSquare className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">{t('learnMore.feature4_title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('learnMore.feature4_text')}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <BrainCircuit className="h-8 w-8 text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="font-semibold">{t('learnMore.feature5_title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('learnMore.feature5_text')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </>
  );
}
