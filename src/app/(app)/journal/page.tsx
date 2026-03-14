
'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { JournalEntry } from '@/lib/types';
import { ArrowUp, ArrowDown, Edit, Trash2, Save, X, BookText, AlertCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/language-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function JournalPage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);

  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  const [currentContent, setCurrentContent] = useState('');
  const [currentFeeling, setCurrentFeeling] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<'feeling' | 'content' | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSaveEntry = () => {
    if (!currentContent.trim() || !currentFeeling.trim()) {
      toast({ title: t('toasts.incompleteEntryTitle'), variant: 'destructive' });
      return;
    }

    if (entryToEdit) {
      const updatedEntries = entries.map(e => 
        e.id === entryToEdit.id 
          ? { ...e, content: currentContent, feeling: currentFeeling } 
          : e
      );
      setEntries(updatedEntries);
      setEntryToEdit(null);
      toast({ title: t('journal.entryUpdated') });
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        content: currentContent,
        feeling: currentFeeling,
      };
      setEntries([newEntry, ...entries]);
      toast({ title: t('toasts.entrySavedTitle') });
    }

    setCurrentContent('');
    setCurrentFeeling('');
  };

  const startVoiceRecognition = useCallback((field: 'feeling' | 'content') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: t('toasts.voiceNotSupportedTitle'),
        description: t('toasts.voiceNotSupportedDescription'),
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ch' ? 'zh-CN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setActiveVoiceField(field);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'feeling') {
        setCurrentFeeling(prev => prev ? `${prev} ${transcript}` : transcript);
      } else {
        setCurrentContent(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setActiveVoiceField(null);
      toast({
        title: t('toasts.voiceErrorTitle'),
        description: event.error === 'not-allowed' 
          ? t('toasts.voiceErrorPermission') 
          : t('toasts.voiceErrorGeneral'),
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveVoiceField(null);
    };

    recognition.start();
  }, [language, t, toast]);

  const startEdit = (entry: JournalEntry) => {
    setEntryToEdit(entry);
    setCurrentContent(entry.content);
    setCurrentFeeling(entry.feeling);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEntryToEdit(null);
    setCurrentContent('');
    setCurrentFeeling('');
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      setEntries(entries.filter(e => e.id !== entryToDelete.id));
      setEntryToDelete(null);
      toast({ title: t('journal.entryDeleted') });
    }
  };

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    const newEntries = [...entries];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newEntries.length) {
      const temp = newEntries[index];
      newEntries[index] = newEntries[targetIndex];
      newEntries[targetIndex] = temp;
      setEntries(newEntries);
    }
  };

  if (!hasMounted) return null;

  return (
    <>
      <PageHeader
        title={t('journal.title')}
        description={t('journal.description')}
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] mt-6 items-start">
        {/* Editor Part - Pinned to left on desktop */}
        <div className="md:sticky md:top-20">
          <Card className={entryToEdit ? 'border-primary ring-1 ring-primary/20 shadow-md' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {entryToEdit ? <Edit className="h-5 w-5 text-primary" /> : <BookText className="h-5 w-5 text-primary" />}
                {entryToEdit ? t('journal.editEntryTitle') : t('journal.newEntryTitle')}
              </CardTitle>
              <CardDescription>
                {t('journal.newEntryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="feeling">{t('journal.feelingLabel')}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 rounded-full ${isListening && activeVoiceField === 'feeling' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
                    onClick={() => startVoiceRecognition('feeling')}
                    disabled={isListening}
                    title={t('journal.voiceListen')}
                  >
                    {isListening && activeVoiceField === 'feeling' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
                <Input 
                  id="feeling"
                  value={currentFeeling} 
                  onChange={(e) => setCurrentFeeling(e.target.value)} 
                  placeholder={t('journal.feelingPlaceholder')} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="thoughts">{t('journal.thoughtsLabel')}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 rounded-full ${isListening && activeVoiceField === 'content' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
                    onClick={() => startVoiceRecognition('content')}
                    disabled={isListening}
                    title={t('journal.voiceListen')}
                  >
                    {isListening && activeVoiceField === 'content' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="relative">
                  <Textarea 
                    id="thoughts"
                    value={currentContent} 
                    onChange={(e) => setCurrentContent(e.target.value)} 
                    placeholder={t('journal.thoughtsPlaceholder')} 
                    className="min-h-[250px] resize-none" 
                  />
                  {isListening && activeVoiceField === 'content' && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 bg-primary/10 rounded text-[10px] text-primary font-medium uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      {t('journal.voiceListening')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button onClick={handleSaveEntry} className="flex-1">
                {entryToEdit ? <Save className="mr-2 h-4 w-4" /> : null}
                {entryToEdit ? t('journal.updateButton') : t('journal.saveButton')}
              </Button>
              {entryToEdit && (
                <Button variant="ghost" onClick={cancelEdit}>
                  <X className="mr-2 h-4 w-4" /> {t('journal.cancel')}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* History Part - Scrollable */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">{t('journal.pastEntriesTitle')}</h3>
            <Badge variant="secondary">{entries.length} {t('journal.entries')}</Badge>
          </div>
          
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-xl border border-dashed">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">{t('journal.noEntries')}</p>
            </div>
          )}

          <div className="space-y-4 pb-12">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm font-semibold">{entry.date}</CardTitle>
                          <Badge variant="outline" className="mt-1 bg-primary/5 border-primary/20">{entry.feeling}</Badge>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={index === 0}
                            onClick={() => moveEntry(index, 'up')}
                            title="Move Up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={index === entries.length - 1}
                            onClick={() => moveEntry(index, 'down')}
                            title="Move Down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary"
                            onClick={() => startEdit(entry)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => setEntryToDelete(entry)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('journal.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('journal.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('journal.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('journal.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
