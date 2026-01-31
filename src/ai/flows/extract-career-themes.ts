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
  try {
    const result = await extractCareerThemesFromModel(input);
    return ExtractCareerThemesOutputSchema.parse(result);
  } catch (error) {
    console.error('Error extracting career themes:', error);
    // Return empty array on failure
    return [];
  }
}
