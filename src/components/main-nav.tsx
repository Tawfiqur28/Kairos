'use client';

import {
  BookText,
  Briefcase,
  Info,
  LayoutDashboard,
  ListChecks,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ikigai', icon: Target, label: 'Ikigai Canvas' },
  { href: '/journal', icon: BookText, label: 'Journal' },
  { href: '/careers', icon: Briefcase, label: 'Careers' },
  { href: '/plan', icon: ListChecks, label: 'Action Plan' },
  { href: '/learn-more', icon: Info, label: 'Learn More' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-accent text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
