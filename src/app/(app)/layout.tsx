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

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

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
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/ikigai') return 'Ikigai Profile';
    if (pathname === '/careers') return 'Career Explorer';
    if (pathname === '/plan') return 'Action Plan';
    if (pathname === '/learn-more') return 'Learn More';
    if (pathname === '/journal') return 'Journal';
    return '';
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-gradient-to-b from-background to-muted/20 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
            <AppLogo />
            {hasActionPlan && (
              <Badge variant="secondary" className="hidden lg:flex">
                Active Plan
              </Badge>
            )}
          </div>
          <div className="flex-1">
            <MainNav />
          </div>
          
          {/* Profile Status Sidebar Footer */}
          <div className="border-t p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Profile Completion</span>
                  <span className="font-bold text-primary">{profileCompletion}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              
              {hasMounted && !isProfileComplete && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium">
                    Complete profile for better matches
                  </p>
                </div>
              )}
              
              {hasActionPlan && (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-300 font-medium">
                    Active plan: {actionPlan!.careerTitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
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
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 mb-4">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <AppLogo />
              </div>
              <div className="flex-1 overflow-y-auto">
                <MainNav />
              </div>
              {/* Mobile Footer Status */}
              <div className="border-t p-4 mt-auto">
                <div className="space-y-4">
                  <div className="sm:hidden space-y-2">
                    {hasMounted && pathname !== '/ikigai' && !isProfileComplete && (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/ikigai" className="flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>Complete Profile</span>
                        </Link>
                      </Button>
                    )}
                    {hasMounted && hasActionPlan && pathname !== '/plan' && (
                       <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/plan" className="flex items-center justify-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          <span>View Plan</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Profile Status</span>
                        <span className="font-bold text-primary">{profileCompletion}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${profileCompletion}%` }}
                        />
                      </div>
                    </div>
                    {hasActionPlan && (
                      <p className="text-xs text-muted-foreground">
                        Active plan: {actionPlan!.careerTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb/Context Area */}
          <div className="w-full flex-1 flex items-center gap-4 overflow-hidden">
            {pathname !== '/dashboard' && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
            )}
            
            <div className="flex items-center gap-2 overflow-hidden">
              {getCurrentSection() && (
                <>
                  <span className="font-medium text-sm sm:text-base truncate">
                    {getCurrentSection()}
                  </span>
                  
                  {/* Contextual Badges */}
                  {hasMounted && pathname === '/ikigai' && !isProfileComplete && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      {profileCompletion < 50 ? 'Incomplete' : `${profileCompletion}%`}
                    </Badge>
                  )}
                  
                  {hasMounted && pathname === '/careers' && !isProfileComplete && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      Profile Required
                    </Badge>
                  )}
                  
                  {hasMounted && pathname === '/plan' && hasActionPlan && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-300">
                      {Math.round(
                        (actionPlan!.phases.reduce((acc, phase) => 
                          acc + phase.tasks.filter(t => t.completed).length, 0) / 
                        actionPlan!.phases.reduce((acc, phase) => acc + phase.tasks.length, 1)) * 100
                      )}% Progress
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Action Button for Profile Completion */}
            {hasMounted && pathname !== '/ikigai' && !isProfileComplete && (
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href="/ikigai" className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span className="text-xs">Complete Profile</span>
                </Link>
              </Button>
            )}
            
            {/* Quick Action Button for Action Plan */}
            {hasMounted && pathname !== '/plan' && hasActionPlan && (
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href="/plan" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-xs">View Plan</span>
                </Link>
              </Button>
            )}
            
            <LanguageSwitcher />
            <UserNav />
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
        
        {/* Footer Status Bar (Desktop only) */}
        <footer className="hidden md:flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-4">
            <span className="font-medium">KAIROS Career Planner</span>
            <span className="text-xs">•</span>
            <span>Dynamic Career Matching</span>
            <span className="text-xs">•</span>
            <span>Personalized Action Plans</span>
          </div>
          <div className="flex items-center gap-4">
            {hasMounted && isProfileComplete ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Profile Complete</span>
              </div>
            ) : hasMounted && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <Link href="/ikigai" className="text-primary hover:underline">
                  Complete Profile ({profileCompletion}%)
                </Link>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
