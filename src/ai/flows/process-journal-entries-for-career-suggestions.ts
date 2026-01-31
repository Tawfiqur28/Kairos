'use server';

/**
 * @fileOverview Analyzes user journal entries to provide career suggestions based on their daily feelings.
 *
 * - processJournalEntriesForCareerSuggestions - A function that processes journal entries and suggests careers.
 * - JournalEntryInput - The input type for the processJournalEntriesForCareerSuggestions function.
 * - CareerSuggestionsOutput - The return type for the processJournalEntriesForCareerSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JournalEntryInputSchema = z.object({
  journalEntries: z.string().describe('A collection of journal entries from the user.'),
  feelings: z.string().describe('A description of the user\'s daily feelings.'),
});
export type JournalEntryInput = z.infer<typeof JournalEntryInputSchema>;

const CareerSuggestionsOutputSchema = z.object({
  careerSuggestions: z.string().describe('A list of career suggestions based on the journal entries and feelings.'),
  analysis: z.string().describe('An analysis of the journal entries and feelings.'),
});
export type CareerSuggestionsOutput = z.infer<typeof CareerSuggestionsOutputSchema>;

export async function processJournalEntriesForCareerSuggestions(
  input: JournalEntryInput
): Promise<CareerSuggestionsOutput> {
  return processJournalEntriesForCareerSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processJournalEntriesForCareerSuggestionsPrompt',
  model: 'googleai/gemini-pro',
  input: {schema: JournalEntryInputSchema},
  output: {schema: CareerSuggestionsOutputSchema},
  prompt: `You are a career counselor. Analyze the following journal entries and feelings of the user to provide career suggestions.

Journal Entries: {{{journalEntries}}}

Feelings: {{{feelings}}}

Based on the user\'s journal entries and feelings, suggest some career paths that the user might find fulfilling and provide an analysis of why these careers might be a good fit for the user, and set the careerSuggestions output field appropriately.
`,
});

const processJournalEntriesForCareerSuggestionsFlow = ai.defineFlow(
  {
    name: 'processJournalEntriesForCareerSuggestionsFlow',
    inputSchema: JournalEntryInputSchema,
    outputSchema: CareerSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
