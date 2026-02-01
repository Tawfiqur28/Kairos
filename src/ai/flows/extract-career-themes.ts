'use server';
/**
 * @fileOverview Extracts career themes from a user's Ikigai profile.
 */

import { z } from 'zod';
import { extractCareerThemes as extractCareerThemesFromModel } from '@/ai/genkit';

const ExtractCareerThemesInputSchema = z.string().describe('A stringified version of the user\'s Ikigai profile.');
export type ExtractCareerThemesInput = z.infer<typeof ExtractCareerThemesInputSchema>;

const ExtractCareerThemesOutputSchema = z.array(z.string()).describe('An array of career theme strings, e.g., ["Tech", "Arts"].');
export type ExtractCareerThemesOutput = z.infer<typeof ExtractCareerThemesOutputSchema>;


export async function extractCareerThemes(
  input: ExtractCareerThemesInput
): Promise<ExtractCareerThemesOutput> {
  const result = await extractCareerThemesFromModel(input);
  // The underlying model is a fast, local function that doesn't throw,
  // so the previous try/catch was unnecessary.
  return ExtractCareerThemesOutputSchema.parse(result);
}
