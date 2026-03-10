'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Moon, Sun, LogOut, User, Settings, Palette } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function UserNav() {
  const [profile] = useLocalStorage('user-profile', { name: 'User' });
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
    'theme',
    'dark'
  );
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleLogout = () => {
    // Clear any auth tokens or user data if needed
    // For now, just show a toast and redirect
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border border-primary/10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} alt={profile.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {t('userNav.email')}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>{t('userNav.profile')}</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/settings" passHref>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('userNav.settings')}</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Palette className="mr-2 h-4 w-4" />
              <span>{t('userNav.theme')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as 'light' | 'dark')
                }
              >
                <DropdownMenuRadioItem value="light" className="cursor-pointer">
                  <Sun className="mr-2 h-4 w-4" />
                  {t('userNav.light')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                  <Moon className="mr-2 h-4 w-4" />
                  {t('userNav.dark')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}