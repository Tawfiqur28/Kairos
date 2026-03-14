
'use client';

import React, { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { ExternalLink, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TechnicalTerm {
  id: string;
  term: string;
  url: string;
  description?: string;
  category?: string;
}

interface TechnicalTextProps {
  text: string;
  className?: string;
}

/**
 * TechnicalText Component
 * Parses text and wraps detected technical terms with Wikipedia links.
 */
export function TechnicalText({ text, className }: TechnicalTextProps) {
  const firestore = useFirestore();

  // Fetch all terms (limited to 500 for performance)
  const termsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'technicalTerms'), limit(500));
  }, [firestore]);

  const { data: terms, isLoading } = useCollection<TechnicalTerm>(termsQuery);

  const parts = useMemo(() => {
    if (!terms || terms.length === 0) return [text];

    // Create a regex from the terms list
    // Sort terms by length descending to match longer phrases first (e.g., "Deep Learning" before "Learning")
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    const escapedTerms = sortedTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

    const result: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add preceding text
      if (match.index > lastIndex) {
        result.push(text.substring(lastIndex, match.index));
      }

      const matchedText = match[0];
      const termData = sortedTerms.find(t => t.term.toLowerCase() === matchedText.toLowerCase());

      if (termData) {
        result.push(
          <Tooltip key={`${termData.id}-${match.index}`} delayDuration={300}>
            <TooltipTrigger asChild>
              <a
                href={termData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-primary hover:text-primary/80 transition-colors border-b border-dotted border-primary/50 hover:border-primary"
              >
                {matchedText}
                <ExternalLink className="h-3 w-3 inline opacity-50" />
              </a>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Info className="h-3 w-3 text-primary" />
                  {termData.term}
                </div>
                {termData.description && (
                  <p className="text-xs text-muted-foreground">{termData.description}</p>
                )}
                <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold pt-1">
                  Click to learn more on Wikipedia
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        result.push(matchedText);
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result;
  }, [text, terms]);

  if (isLoading) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>{part}</React.Fragment>
      ))}
    </span>
  );
}
