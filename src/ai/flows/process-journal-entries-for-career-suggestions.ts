'use server';

/**
 * @fileOverview Analyzes user journal entries to provide career suggestions based on their daily feelings.
 *
 * - processJournalEntriesForCareerSuggestions - A function that processes journal entries and suggests careers.
 * - JournalEntryInput - The input type for the processJournalEntriesForCareerSuggestions function.
 * - CareerSuggestionsOutput - The return type for the processJournalEntriesForCareerSuggestions function.
 */
import { z } from 'zod';
import { processJournalEntriesForCareerSuggestions as processJournalEntriesFromModel } from '@/ai/genkit';

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
    const result = await processJournalEntriesFromModel(input.journalEntries, input.feelings);
    return CareerSuggestionsOutputSchema.parse(result);
}
