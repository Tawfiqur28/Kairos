'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export function AppLogo({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <Link
      href="/"
      className={cn('font-headline text-3xl font-bold', className)}
    >
      <span className="uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
        {t('header.logo')}
      </span>
    </Link>
  );
}
