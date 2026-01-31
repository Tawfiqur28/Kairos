

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

// UPDATED: Added overallScore and themeMismatch
const GenerateCareerMatchExplanationsOutputSchema = z.object({
  explanation: z.string().describe('A personalized explanation of why the career is a good match for the user.'),
  skillMatch: z.number().describe('A numerical score for skill match (0-100).'),
  interestMatch: z.number().describe('A numerical score for interest match (0-100).'),
  valueAlignment: z.number().describe('A numerical score for value alignment (0-100).'),
  overallScore: z.number().describe('Overall weighted score (0-100).'), // NEW
  themeMismatch: z.boolean().describe('Whether there is a major theme mismatch.'), // NEW
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the match prediction.') // NEW
});

export type GenerateCareerMatchExplanationsOutput = z.infer<typeof GenerateCareerMatchExplanationsOutputSchema>;

export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  try {
    const result = await generateCareerMatchExplanationsFromModel(
      input.userProfile,
      input.career,
      input.careerDetails
    );
    
    // Validate with Zod before returning
    return GenerateCareerMatchExplanationsOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error generating career match explanations:', error);
    
    // UPDATED: Enhanced fallback response
    const isScienceCareer = input.career.toLowerCase().includes('physic') || 
                           input.career.toLowerCase().includes('chemist') ||
                           input.career.toLowerCase().includes('engineer');
    
    const isMusicCareer = input.career.toLowerCase().includes('music') || 
                         input.career.toLowerCase().includes('producer') ||
                         input.career.toLowerCase().includes('composer');
    
    // Dynamic fallback based on career type
    let baseScore = 70;
    if (isScienceCareer) baseScore = 65;
    if (isMusicCareer) baseScore = 60;
    
    return {
      explanation: `Temporary analysis: ${input.career} shows ${baseScore}% potential alignment based on general trends. For personalized results, ensure your profile includes specific skills and interests.`,
      skillMatch: baseScore,
      interestMatch: baseScore,
      valueAlignment: baseScore,
      overallScore: baseScore, // NEW
      themeMismatch: false, // NEW
      confidence: 'low' // NEW
    };
  }
}