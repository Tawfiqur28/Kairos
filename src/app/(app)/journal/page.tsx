'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { JournalEntry, Ikigai } from '@/lib/types';
import { Mic, MicOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/language-context';

declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
}

const initialIkigai: Ikigai = {
  passions: '',
  skills: '',
  values: '',
  interests: '',
  educationLevel: undefined,
};

export default function JournalPage() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  const [currentContent, setCurrentContent] = useState('');
  const [currentFeeling, setCurrentFeeling] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();
  const [ikigai] = useLocalStorage<Ikigai>('ikigai-profile', initialIkigai);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [hasMounted, setHasMounted] = useState(false);
  const [journalPlaceholder, setJournalPlaceholder] = useState('');

  useEffect(() => {
    setHasMounted(true);
    // Set placeholder initially and then update when ikigai profile is loaded
    setJournalPlaceholder(t('journal.thoughtsPlaceholder'));
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSpeechRecognitionSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; 

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + '. ';
          }
        }
        setCurrentContent(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: t('toasts.voiceErrorTitle'),
          description: event.error === 'not-allowed' ? t('toasts.voiceErrorPermission') : t('toasts.voiceErrorGeneral'),
          variant: "destructive"
        });
        setIsListening(false);
      }
    }
  }, [t]);
  
  useEffect(() => {
    if(!hasMounted) return;
    const getPlaceholder = () => {
      switch (ikigai.educationLevel) {
        case 'highSchool':
          return 'What did you learn in math class today?';
        case 'undergrad':
          return 'Describe a concept you struggled with this week.';
        case 'masters':
          return 'Log your research progress and challenges.';
        case 'phd':
          return 'Document breakthrough ideas and paper references.';
        default:
          return t('journal.thoughtsPlaceholder');
      }
    };
    setJournalPlaceholder(getPlaceholder());
  }, [ikigai.educationLevel, t, hasMounted]);

  const handleToggleListening = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: t('toasts.voiceNotSupportedTitle'),
        description: t('toasts.voiceNotSupportedDescription'),
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(prev => !prev);
  };

  const handleSaveEntry = () => {
    if (!currentContent.trim() || !currentFeeling.trim()) {
      toast({
        title: t('toasts.incompleteEntryTitle'),
        description: t('toasts.incompleteEntryDescription'),
        variant: 'destructive',
      });
      return;
    }
    const newEntry: JournalEntry = {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      content: currentContent,
      feeling: currentFeeling,
    };
    setEntries([newEntry, ...entries]);
    setCurrentContent('');
    setCurrentFeeling('');
    toast({
      title: t('toasts.entrySavedTitle'),
      description: t('toasts.entrySavedDescription'),
    });
  };

  return (
    <>
      <PageHeader
        title={t('journal.title')}
        description={t('journal.description')}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('journal.newEntryTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feeling">{t('journal.feelingLabel')}</Label>
              <Input
                id="feeling"
                placeholder={t('journal.feelingPlaceholder')}
                value={currentFeeling}
                onChange={(e) => setCurrentFeeling(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">{t('journal.thoughtsLabel')}</Label>
                {isSpeechRecognitionSupported && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleListening}
                    className={isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}
                  >
                    {isListening ? <MicOff /> : <Mic />}
                    <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                placeholder={journalPlaceholder}
                className="min-h-32"
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveEntry}>{t('journal.saveButton')}</Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold font-headline">{t('journal.pastEntriesTitle')}</h3>
          {entries.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{entry.date}</CardTitle>
                    <CardDescription>{t('journal.feeling')}{entry.feeling}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground break-words">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
              <p>{t('journal.noEntries')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
