
'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { JournalEntry, Ikigai } from '@/lib/types';
import { Bot, Mic, MicOff, MoreVertical, Edit, Trash2, Send, Sparkles, Image as ImageIcon, Camera, Loader2, BookText, BrainCircuit } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/language-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageDataUri?: string;
}

export default function AcademicAssistantPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);

  // Journal State
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  const [currentContent, setCurrentContent] = useState('');
  const [currentFeeling, setCurrentFeeling] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
  
  // Chat State
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('academic-chat-history', []);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) setCurrentContent(prev => prev + (prev ? ' ' : '') + transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isTyping]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: t('toasts.voiceNotSupportedTitle'), variant: 'destructive' });
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsListening(!isListening);
  };

  const handleSaveEntry = () => {
    if (!currentContent.trim() || !currentFeeling.trim()) {
      toast({ title: t('toasts.incompleteEntryTitle'), variant: 'destructive' });
      return;
    }
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      content: currentContent,
      feeling: currentFeeling,
    };
    setEntries([newEntry, ...entries]);
    setCurrentContent('');
    setCurrentFeeling('');
    toast({ title: t('toasts.entrySavedTitle') });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      imageDataUri: uploadedImage || undefined,
    };

    setChatHistory([...chatHistory, userMessage]);
    setInputMessage('');
    setUploadedImage(null);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory.concat(userMessage).map(m => ({ role: m.role, content: m.content })),
          imageDataUri: userMessage.imageDataUri,
        }),
      });

      const data = await response.text();
      
      if (data.startsWith('ERROR:')) throw new Error(data);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        title: "Academic Assistant Error",
        description: "I'm having trouble connecting to my academic brain. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <>
      <PageHeader
        title="Academic Assistant"
        description="Your multi-modal companion for rigorous math solving and reflective journaling."
      />

      <Tabs defaultValue="chat" className="w-full mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" /> AI Companion
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookText className="h-4 w-4" /> Daily Journal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card className="flex flex-col h-[70vh]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Thetawise Brain
                  </CardTitle>
                  <CardDescription>Upload a photo of your math problem or ask an academic question.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setChatHistory([])}>Clear History</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground opacity-50">
                      <Sparkles className="h-12 w-12 mb-2" />
                      <p>Start a conversation. I can solve calculus, algebra, physics, and more.</p>
                    </div>
                  )}
                  {chatHistory.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {msg.imageDataUri && (
                          <img src={msg.imageDataUri} alt="Problem" className="rounded-md mb-2 max-h-48" />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] opacity-50 block mt-1">{msg.timestamp}</span>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing problem...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t gap-2 flex-col">
              {uploadedImage && (
                <div className="w-full flex items-center gap-2 mb-2 bg-muted p-2 rounded-md">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs truncate flex-1">Image attached</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUploadedImage(null)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="w-full flex gap-2">
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Ask a math problem or upload a screenshot..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reflective Journal</CardTitle>
                <CardDescription>Track your emotional and academic growth.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Feeling</Label>
                  <Input value={currentFeeling} onChange={(e) => setCurrentFeeling(e.target.value)} placeholder="Curious, challenged, confident..." />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Reflection</Label>
                    <Button variant="ghost" size="icon" onClick={handleToggleListening} className={isListening ? 'text-destructive animate-pulse' : ''}>
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Textarea value={currentContent} onChange={(e) => setCurrentContent(e.target.value)} placeholder="What did you learn today?" className="min-h-32" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveEntry} className="w-full">Save Entry</Button>
              </CardFooter>
            </Card>

            <div className="space-y-4">
              <h3 className="font-bold">Past Reflections</h3>
              <ScrollArea className="h-[500px]">
                <AnimatePresence>
                  {entries.map((entry) => (
                    <Card key={entry.id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-sm">{entry.date}</CardTitle>
                          <Badge variant="outline">{entry.feeling}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{entry.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
