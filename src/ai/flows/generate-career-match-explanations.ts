
/**
 * @fileOverview Generates personalized explanations for why a career is a good match for the user.
 */

import { z } from 'genkit';
import { generateCareerMatchExplanations as callModelScopeAI } from '@/ai/genkit';

// Input schema
const GenerateCareerMatchExplanationsInputSchema = z.object({
  userProfile: z.string().describe('A detailed description of the user profile, including their passions, skills, values, and interests.'),
  career: z.string().describe('The name of the career being evaluated for a match.'),
  careerDetails: z.string().describe('A comprehensive description of the career, including required skills, typical responsibilities, and work environment.'),
});

export type GenerateCareerMatchExplanationsInput = z.infer<typeof GenerateCareerMatchExplanationsInputSchema>;

// Output schema  
const GenerateCareerMatchExplanationsOutputSchema = z.object({
  explanation: z.string().describe('A personalized explanation of why the career is a good match for the user.'),
  fitScore: z.number().describe('A numerical score indicating the degree of fit between the user profile and the career (0-100).'),
});

export type GenerateCareerMatchExplanationsOutput = z.infer<typeof GenerateCareerMatchExplanationsOutputSchema>;

/**
 * Main flow function that calls ModelScope AI
 */
export async function generateCareerMatchExplanationsFlow(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  try {
    // Call the ModelScope AI function
    const result = await callModelScopeAI(
      input.userProfile,
      input.career, 
      input.careerDetails
    );
    
    return result;
  } catch (error) {
    console.error('Error generating career match explanations:', error);
    
    // Fallback response if AI fails
    return {
      explanation: `Based on your profile showing interest in ${input.career}, this career aligns with several of your skills and interests. Consider exploring related courses or internships to learn more.`,
      fitScore: 70
    };
  }
}

/**
 * Alias for backward compatibility
 */
export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  return generateCareerMatchExplanationsFlow(input);
}
