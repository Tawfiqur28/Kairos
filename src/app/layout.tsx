import type { Metadata } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/context/language-context';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontCode = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
});

export const metadata: Metadata = {
  title: 'Kairos Compass',
  description: 'Find your professional Ikigai with AI-powered guidance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontBody.variable,
          fontCode.variable
        )}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
