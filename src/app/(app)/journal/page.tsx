'use client';

import { kairosChat } from '@/ai/flows/kairos-chat';
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
import { Bot, Loader2, Mic, MicOff, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/language-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

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

  // Chatbot states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSpeechRecognitionSupported(true);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);


  const getJournalPlaceholder = () => {
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

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported) {
      toast({
        title: t('toasts.voiceNotSupportedTitle'),
        description: t('toasts.voiceNotSupportedDescription'),
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
        title: t('toasts.voiceErrorTitle'),
        description: event.error === 'not-allowed' ? t('toasts.voiceErrorPermission') : t('toasts.voiceErrorGeneral'),
        variant: "destructive"
      });
      setIsListening(false);
    }

    recognitionRef.current.start();
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const userProfileString = `Passions: ${ikigai.passions}. Skills: ${ikigai.skills}. Values: ${ikigai.values}. Interests: ${ikigai.interests}. Current Education Level: ${ikigai.educationLevel}.`;
      
      const result = await kairosChat({
        message: chatInput,
        history: chatHistory,
        userProfile: userProfileString,
      });

      const assistantMessage: ChatMessage = { role: 'assistant', content: result.message };
      setChatHistory(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error(error);
      toast({
        title: t('toasts.aiErrorTitle'),
        description: t('toasts.aiErrorJournal'),
        variant: 'destructive',
      });
      // Add error message to chat
      const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t('journal.title')}
        description={t('journal.description')}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
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
                  placeholder={hasMounted ? getJournalPlaceholder() : t('journal.thoughtsPlaceholder')}
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
          
          <Card>
            <CardHeader>
              <CardTitle>KAIROS Assistant</CardTitle>
              <CardDescription>
                Your personal AI guide for academic and career questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex flex-col">
                <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20" ref={chatContainerRef}>
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot size={48} className="mb-4" />
                      <p>Ask me anything about your studies, college applications, or career path!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                          {msg.role === 'assistant' && <Avatar className="h-8 w-8"><AvatarFallback><Bot size={16}/></AvatarFallback></Avatar>}
                          <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback><Bot size={16}/></AvatarFallback></Avatar>
                          <div className="p-3 rounded-lg bg-background flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isChatLoading}
                  />
                  <Button type="submit" disabled={isChatLoading || !chatInput.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-headline">{t('journal.pastEntriesTitle')}</h3>
          {entries.length > 0 ? (
            <ScrollArea className="space-y-4 max-h-[700px] overflow-y-auto pr-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{entry.date}</CardTitle>
                    <CardDescription>{t('journal.feeling')}{entry.feeling}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>{t('journal.noEntries')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
