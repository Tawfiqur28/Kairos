import { Compass } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-headline text-lg font-semibold", className)}
    >
      <Compass className="h-6 w-6 text-primary" />
      <span>Kairos Compass</span>
    </Link>
  );
}
