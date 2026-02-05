'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import en from '@/lib/locales/en.json';
import ch from '@/lib/locales/ch.json';

type Language = 'en' | 'ch';

const translations = { en, ch };

type Replacements = Record<string, string | number>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Replacements) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, replacements?: Replacements): string => {
    const keys = key.split('.');
    
    let text: any = translations[language];
    for (const k of keys) {
      text = text?.[k];
      if (text === undefined) {
        break;
      }
    }

    if (typeof text !== 'string') {
      // Fallback to English if translation is missing or not a string
      text = translations.en;
      for (const k of keys) {
        text = text?.[k];
        if (text === undefined) {
          break;
        }
      }
    }
    
    if (typeof text !== 'string') {
      return key; // Return key if not found in either language
    }

    let resultString = text;

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            const regex = new RegExp(`\\{${rKey}\\}`, 'g');
            resultString = resultString.replace(regex, String(replacements[rKey]));
        });
    }
    
    return resultString;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
