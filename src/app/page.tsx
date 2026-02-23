'use client';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';

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
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              {t('hero.title1')}{' '}
              <span className="text-primary">{t('hero.title2')}</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              {t('hero.subtitle')}
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                {t('hero.cta1')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
             <Button asChild size="lg" variant="outline">
                  <Link href="/learn-more">{t('hero.cta2')}</Link>
             </Button>
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
