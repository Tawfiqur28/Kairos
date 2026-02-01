'use server';
/**
 * @fileOverview Generates personalized explanations for why a career is a good match for the user.
 */

import { z } from 'zod';
import { generateCareerMatchExplanations as generateCareerMatchExplanationsFromModel } from '@/ai/genkit';

const GenerateCareerMatchExplanationsInputSchema = z.object({
  userProfile: z.string().describe('A detailed description of the user profile, including their passions, skills, values, and interests.'),
  career: z.string().describe('The name of the career being evaluated for a match.'),
  careerDetails: z.string().describe('A comprehensive description of the career, including required skills, typical responsibilities, and work environment.'),
});

export type GenerateCareerMatchExplanationsInput = z.infer<typeof GenerateCareerMatchExplanationsInputSchema>;

const GenerateCareerMatchExplanationsOutputSchema = z.object({
  explanation: z.string().describe('A personalized explanation of why the career is a good match for the user.'),
  skillMatch: z.number().describe('A numerical score for skill match (0-100).'),
  interestMatch: z.number().describe('A numerical score for interest match (0-100).'),
  valueAlignment: z.number().describe('A numerical score for value alignment (0-100).'),
  overallScore: z.number().describe('Overall weighted score (0-100).'),
  themeMismatch: z.boolean().describe('Whether there is a major theme mismatch.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the match prediction.')
});

export type GenerateCareerMatchExplanationsOutput = z.infer<typeof GenerateCareerMatchExplanationsOutputSchema>;

export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  // Removed redundant try/catch and fallback logic.
  // The more sophisticated, science-aware fallback is now handled exclusively in the core `genkit.ts` file.
  const result = await generateCareerMatchExplanationsFromModel(
    input.userProfile,
    input.career,
    input.careerDetails
  );
  
  // The frontend has its own try/catch, so we just validate the output here.
  return GenerateCareerMatchExplanationsOutputSchema.parse(result);
}
