'use server';

/**
 * @fileOverview Generates personalized explanations for why a career is a good match for the user.
 *
 * - generateCareerMatchExplanations - A function that generates career match explanations.
 * - GenerateCareerMatchExplanationsInput - The input type for the generateCareerMatchExplanations function.
 * - GenerateCareerMatchExplanationsOutput - The return type for the generateCareerMatchExplanations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCareerMatchExplanationsInputSchema = z.object({
  userProfile: z.string().describe('A detailed description of the user profile, including their passions, skills, values, and interests.'),
  career: z.string().describe('The name of the career being evaluated for a match.'),
  careerDetails: z.string().describe('A comprehensive description of the career, including required skills, typical responsibilities, and work environment.'),
});
export type GenerateCareerMatchExplanationsInput = z.infer<typeof GenerateCareerMatchExplanationsInputSchema>;

const GenerateCareerMatchExplanationsOutputSchema = z.object({
  explanation: z.string().describe('A personalized explanation of why the career is a good match for the user, based on their profile and the career details.'),
  fitScore: z.number().describe('A numerical score indicating the degree of fit between the user profile and the career (0-100).'),
});
export type GenerateCareerMatchExplanationsOutput = z.infer<typeof GenerateCareerMatchExplanationsOutputSchema>;

export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  return generateCareerMatchExplanationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCareerMatchExplanationsPrompt',
  model: 'googleai/gemini-pro',
  input: {schema: GenerateCareerMatchExplanationsInputSchema},
  output: {schema: GenerateCareerMatchExplanationsOutputSchema},
  prompt: `You are a career advisor. You will receive a user profile and career details. Your task is to provide a personalized explanation of why the career is a good match for the user, and provide a numerical score indicating the degree of fit (0-100). Set the fitScore output field appropriately based on your analysis.\n\nUser Profile: {{{userProfile}}}\n\nCareer: {{{career}}}\nCareer Details: {{{careerDetails}}}`,
});

const generateCareerMatchExplanationsFlow = ai.defineFlow(
  {
    name: 'generateCareerMatchExplanationsFlow',
    inputSchema: GenerateCareerMatchExplanationsInputSchema,
    outputSchema: GenerateCareerMatchExplanationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
