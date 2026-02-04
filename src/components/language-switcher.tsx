'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={cn(language === 'en' && 'bg-accent')}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ch')}
          className={cn(language === 'ch' && 'bg-accent')}
        >
          中文 (Chinese)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
