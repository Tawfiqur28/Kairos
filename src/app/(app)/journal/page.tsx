'use client';

import { processJournalEntriesForCareerSuggestions } from '@/ai/flows/process-journal-entries-for-career-suggestions';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { JournalEntry } from '@/lib/types';
import { Bot, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type CareerSuggestions = {
  careerSuggestions: string;
  analysis: string;
};

declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
}

export default function JournalPage() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  const [currentContent, setCurrentContent] = useState('');
  const [currentFeeling, setCurrentFeeling] = useState('');
  const [suggestions, setSuggestions] = useState<CareerSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSpeechRecognitionSupported(true);
    }
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true; 

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
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
        title: "Voice Recognition Error",
        description: event.error === 'not-allowed' ? "Please grant microphone permissions." : "An error occurred during voice recognition.",
        variant: "destructive"
      });
      setIsListening(false);
    }

    recognitionRef.current.start();
  };

  const handleSaveEntry = () => {
    if (!currentContent.trim() || !currentFeeling.trim()) {
      toast({
        title: 'Incomplete Entry',
        description: 'Please fill out both your thoughts and feelings.',
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
      title: 'Entry Saved',
      description: 'Your journal has been updated.',
    });
  };

  const handleGetSuggestions = async () => {
    if (entries.length === 0) {
      toast({
        title: 'Not Enough Data',
        description: 'Please write at least one journal entry first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSuggestions(null);

    try {
      const journalData = entries
        .map((e) => `Date: ${e.date}, Feeling: ${e.feeling}\nEntry: ${e.content}`)
        .join('\n\n');
      
      const result = await processJournalEntriesForCareerSuggestions({
        journalEntries: journalData,
        feelings: "A summary of daily feelings across entries.", // This could be more sophisticated
      });
      setSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description: 'Could not generate career suggestions at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Daily Journal"
        description="Reflect on your day. Your thoughts can reveal hidden career passions."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feeling">How are you feeling today?</Label>
                <Input
                  id="feeling"
                  placeholder="e.g., Energized, curious, a bit tired..."
                  value={currentFeeling}
                  onChange={(e) => setCurrentFeeling(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">What's on your mind?</Label>
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
                  placeholder="Describe your day, your tasks, what you enjoyed, and what you didn't."
                  className="min-h-32"
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEntry}>Save Entry</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Career Insights</CardTitle>
              <CardDescription>
                Based on your journal, here are some career paths you might find fulfilling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4">AI is analyzing your journal...</p>
                </div>
              )}
              {suggestions && !isLoading && (
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-bold mb-2 font-headline">Analysis:</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{suggestions.analysis}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 font-headline">Suggestions:</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{suggestions.careerSuggestions}</p>
                  </div>
                </div>
              )}
               {!suggestions && !isLoading && (
                 <div className="text-center text-muted-foreground py-8">
                    <Bot size={48} className="mx-auto mb-4"/>
                    <p>Click the button to generate suggestions from your entries.</p>
                 </div>
               )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGetSuggestions} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Suggestions
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-headline">Past Entries</h3>
          {entries.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{entry.date}</CardTitle>
                    <CardDescription>Feeling: {entry.feeling}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>No journal entries yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
