'use client';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, PenSquare, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const IkigaiDiagram = dynamic(() => import('@/components/ikigai-diagram').then(mod => mod.IkigaiDiagram), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-auto aspect-square rounded-full" />
});


export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <AppLogo />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-12 pb-8 pt-6 md:grid-cols-2 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-4">
            <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.1]">
              {t('hero.title1')}{' '}
              <span className="text-primary">{t('hero.title2')}</span>
              <br className="hidden sm:inline" />
              <span className="text-accent">{t('hero.title3')}</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              {t('hero.subtitle')}
            </p>
            <div className="mt-2 grid gap-3 text-left">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  {t('hero.feature1')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  {t('hero.feature2')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  {t('hero.feature3')}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  {t('hero.cta1')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn-more">{t('hero.cta2')}</Link>
              </Button>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <IkigaiDiagram className="w-full h-auto" />
          </div>
        </section>

        <section
          id="features"
          className="container space-y-12 py-8 md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              {t('features.title')}
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <Target className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">
                    {t('features.card1_title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.card1_text')}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <Bot className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">
                    {t('features.card2_title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.card2_text')}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2 shadow">
              <div className="flex h-[220px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <PenSquare className="h-12 w-12 text-primary" />
                  <h3 className="font-bold font-headline">
                    {t('features.card3_title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.card3_text')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="container">
        <div className="flex flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <AppLogo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              {t('footer.text')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
