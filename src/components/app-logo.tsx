import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("font-headline text-3xl font-bold", className)}
    >
      <span className="uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
        KAIROS
      </span>
    </Link>
  );
}
