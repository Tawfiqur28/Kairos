'use client';

import { AppLogo } from '@/components/app-logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Sparkles, Target, Home } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { Ikigai, ActionPlan } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/language-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const { t } = useLanguage();
  const pathname = usePathname();
  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', {
    passions: '',
    skills: '',
    values: '',
    interests: '',
    educationLevel: undefined,
  });
  const [actionPlan] = useLocalStorage<ActionPlan | null>('action-plan', null);

  const profileCompletion = useMemo(() => {
    if (!hasMounted) return 0;
    let completed = 0;
    const fields = ['passions', 'skills', 'values', 'interests'];
    fields.forEach(field => {
      if (ikigai[field as keyof Ikigai] && ikigai[field as keyof Ikigai]!.length > 10) completed++;
    });
    if (ikigai.educationLevel) completed++;
    return Math.round((completed / 5) * 100);
  }, [ikigai, hasMounted]);

  const isProfileComplete = useMemo(() => profileCompletion >= 80, [profileCompletion]);
  
  const hasActionPlan = useMemo(() => {
    if (!hasMounted) return false;
    return !!(actionPlan && actionPlan.phases && actionPlan.phases.length > 0);
  }, [actionPlan, hasMounted]);

  // Get current section for breadcrumb/context
  const getCurrentSection = () => {
    if (pathname === '/dashboard') return t('layout.sectionDashboard');
    if (pathname === '/ikigai') return t('layout.sectionIkigai');
    if (pathname === '/careers') return t('layout.sectionCareers');
    if (pathname === '/plan') return t('layout.sectionPlan');
    if (pathname === '/learn-more') return t('layout.sectionLearnMore');
    if (pathname === '/journal') return t('layout.sectionJournal');
    if (pathname === '/profile') return t('layout.sectionProfile');
    return '';
  };

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const progressBarVariants = {
    initial: { width: 0 },
    animate: { width: `${profileCompletion}%` },
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <AnimatePresence>
        {hasMounted && (
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="hidden border-r bg-gradient-to-b from-background to-muted/20 md:block"
          >
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
                <AppLogo />
                {hasActionPlan && (
                  <Badge variant="secondary" className="hidden lg:flex">
                    {t('layout.activePlan')}
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <MainNav />
              </div>
              
              {/* Profile Status Sidebar Footer */}
              <motion.div 
                className="border-t p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{t('layout.profileCompletion')}</span>
                      <motion.span 
                        className="font-bold text-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {profileCompletion}%
                      </motion.span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${profileCompletion}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  
                  {hasMounted && !isProfileComplete && (
                    <motion.div 
                      className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium">
                        {t('layout.completeProfilePrompt')}
                      </p>
                    </motion.div>
                  )}
                  
                  {hasActionPlan && (
                    <motion.div 
                      className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-xs text-green-800 dark:text-green-300 font-medium">
                        {t('layout.activePlanFor', { careerTitle: actionPlan!.careerTitle })}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('layout.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 mb-4">
                <SheetTitle className="sr-only">{t('layout.menu')}</SheetTitle>
                <AppLogo />
              </div>
              <div className="flex-1 overflow-y-auto">
                <MainNav />
              </div>
              {/* Mobile Footer Status */}
              <motion.div 
                className="border-t p-4 mt-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-4">
                  <div className="sm:hidden space-y-2">
                    {hasMounted && pathname !== '/ikigai' && !isProfileComplete && (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/ikigai" className="flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{t('layout.completeProfile')}</span>
                        </Link>
                      </Button>
                    )}
                    {hasMounted && hasActionPlan && pathname !== '/plan' && (
                       <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/plan" className="flex items-center justify-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          <span>{t('layout.viewPlan')}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{t('layout.profileStatus')}</span>
                        <span className="font-bold text-primary">{profileCompletion}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${profileCompletion}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    {hasActionPlan && (
                      <p className="text-xs text-muted-foreground">
                        {t('layout.activePlanFor', { careerTitle: actionPlan!.careerTitle })}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb/Context Area */}
          <div className="w-full flex-1 flex items-center gap-4 overflow-hidden">
            {pathname !== '/dashboard' && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-1" />
                  {t('layout.sectionDashboard')}
                </Link>
              </Button>
            )}
            
            <div className="flex items-center gap-2 overflow-hidden">
              {getCurrentSection() && (
                <>
                  <motion.span 
                    key={pathname}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium text-sm sm:text-base truncate"
                  >
                    {getCurrentSection()}
                  </motion.span>
                  
                  {/* Contextual Badges */}
                  {hasMounted && pathname === '/ikigai' && !isProfileComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        {profileCompletion < 50 ? t('layout.statusIncomplete') : `${profileCompletion}%`}
                      </Badge>
                    </motion.div>
                  )}
                  
                  {hasMounted && pathname === '/careers' && !isProfileComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                        {t('layout.statusProfileRequired')}
                      </Badge>
                    </motion.div>
                  )}
                  
                  {hasMounted && pathname === '/plan' && hasActionPlan && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-300">
                        {t('layout.progressPercent', {
                          progress: Math.round(
                            (actionPlan!.phases.reduce((acc, phase) => 
                              acc + phase.tasks.filter(t => t.completed).length, 0) / 
                            actionPlan!.phases.reduce((acc, phase) => acc + phase.tasks.length, 1)) * 100
                          )
                        })}
                      </Badge>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Action Button for Profile Completion */}
            {hasMounted && pathname !== '/ikigai' && !isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                  <Link href="/ikigai" className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span className="text-xs">{t('layout.completeProfile')}</span>
                  </Link>
                </Button>
              </motion.div>
            )}
            
            {/* Quick Action Button for Action Plan */}
            {hasMounted && pathname !== '/plan' && hasActionPlan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                  <Link href="/plan" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs">{t('layout.viewPlan')}</span>
                  </Link>
                </Button>
              </motion.div>
            )}
            
            <LanguageSwitcher />
            <UserNav />
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
        
        {/* Footer Status Bar (Desktop only) */}
        <footer className="hidden md:flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-4">
            <span className="font-medium">{t('layout.footerTitle')}</span>
            <span className="text-xs">•</span>
            <span>{t('layout.footerSubtitle1')}</span>
            <span className="text-xs">•</span>
            <span>{t('layout.footerSubtitle2')}</span>
          </div>
          <div className="flex items-center gap-4">
            {hasMounted && isProfileComplete ? (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className="h-2 w-2 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>{t('layout.footerProfileComplete')}</span>
              </motion.div>
            ) : hasMounted && (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className="h-2 w-2 rounded-full bg-yellow-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Link href="/ikigai" className="text-primary hover:underline">
                  {t('layout.footerCompleteProfilePrompt', { completion: profileCompletion })}
                </Link>
              </motion.div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}