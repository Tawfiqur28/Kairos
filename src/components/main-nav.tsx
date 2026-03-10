'use client';

import {
  BookOpenCheck,
  Briefcase,
  Info,
  LayoutDashboard,
  Target,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

const navItemsConfig = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/ikigai', icon: Target, labelKey: 'nav.ikigai' },
  { href: '/journal', icon: BookOpenCheck, labelKey: 'nav.journal' },
  { href: '/careers', icon: Briefcase, labelKey: 'nav.careers' },
  { href: '/plan', icon: ClipboardList, labelKey: 'nav.actionPlan' },
  { href: '/learn-more', icon: Info, labelKey: 'nav.learnMore' },
];

export function MainNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = navItemsConfig.map(item => ({...item, label: t(item.labelKey)}));

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50',
            pathname.startsWith(item.href) && item.href !== '/dashboard' && 'bg-accent/50 text-primary font-semibold',
            pathname === item.href && item.href === '/dashboard' && 'bg-accent/50 text-primary font-semibold'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
