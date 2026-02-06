'use server';
/**
 * @fileOverview Generates personalized explanations for why a career is a good match for the user.
 */

import { z } from 'zod';
import { extractCareerThemesEnhanced } from './extract-career-themes'; 
import { callModelScopeAI, callFastModelScopeAI } from '@/ai/utils';

const GenerateCareerMatchExplanationsInputSchema = z.object({
  userProfile: z.string().describe('A detailed description of the user profile, including their passions, skills, values, and interests.'),
  career: z.string().describe('The name of the career being evaluated for a match.'),
  careerDetails: z.string().describe('A comprehensive description of the career, including required skills, typical responsibilities, and work environment.'),
  careerCluster: z.string().optional().describe('Optional career cluster/industry for better matching'),
});

export type GenerateCareerMatchExplanationsInput = z.infer<typeof GenerateCareerMatchExplanationsInputSchema>;

const GenerateCareerMatchExplanationsOutputSchema = z.object({
  explanation: z.string().describe('A personalized explanation of why the career is a good match for the user.'),
  skillMatch: z.number().describe('A numerical score for skill match (0-100).'),
  interestMatch: z.number().describe('A numerical score for interest match (0-100).'),
  valueAlignment: z.number().describe('A numerical score for value alignment (0-100).'),
  overallScore: z.number().describe('Overall weighted score (0-100).'),
  themeMismatch: z.boolean().describe('Whether there is a major theme mismatch.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the match prediction.'),
  educationAlignment: z.string().optional(),
  timeline: z.string().optional(),
  nextSteps: z.array(z.string()).optional()
});

export type GenerateCareerMatchExplanationsOutput = z.infer<typeof GenerateCareerMatchExplanationsOutputSchema>;

const extractEducationLevelFromDetails = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  if (details.includes('high school') || details.includes('highschool')) return 'highSchool';
  if (details.includes('undergraduate') || details.includes('bachelor') || details.includes('college')) return 'undergrad';
  if (details.includes('master') || details.includes('graduate')) return 'masters';
  if (details.includes('phd') || details.includes('doctorate')) return 'phd';
  if (details.includes('professional') || details.includes('working')) return 'professional';
  return 'not_specified';
};

const generateCareerMatchExplanationsFromModel = async (
  userProfile: string, 
  career: string, 
  careerDetails: string,
  userThemes: string[],
  baseScore: number
): Promise<GenerateCareerMatchExplanationsOutput> => {
    
    const prompt = `Analyze career fit.

USER PROFILE (Themes: [${userThemes.join(', ')}]): ${userProfile}

CAREER: ${career}
CAREER DETAILS: ${careerDetails}

**SCORING CONSIDERATIONS:**
1. skillMatch (0-100): Current skill alignment.
2. interestMatch (0-100): Interest alignment.
3. valueAlignment (0-100): How well career fits personal values.

**BASE CALCULATION:** Start from a base score of ${baseScore}% (derived from theme match) and adjust based on the profile details.

Calculate: overallScore = (skillMatch * 0.5) + (interestMatch * 0.3) + (valueAlignment * 0.2)

**REQUIRED OUTPUT (JSON):**
{
  "explanation": "Detailed analysis of the match...",
  "skillMatch": 85,
  "interestMatch": 90,
  "valueAlignment": 70,
  "overallScore": 83,
  "themeMismatch": false,
  "confidence": "high"
}`;

    const response = await callModelScopeAI(prompt, 'qwen-max');
    
    if (response.startsWith('ERROR:')) {
        throw new Error(response);
    }
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Basic validation
      if(parsed.overallScore) {
        return GenerateCareerMatchExplanationsOutputSchema.parse(parsed);
      }
    }
  
  throw new Error("Failed to parse AI response for career match.");
};


// Local fast scoring function
const calculateBaseScoreFromThemes = (userThemes: string[], career: string, careerCluster?: string): number => {
  let score = 50; 
  
  const CAREER_THEME_DATABASE: Record<string, { requiredThemes: string[], incompatibleThemes: string[] }> = {
    'Software Engineer': { requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
    'Data Scientist': { requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
    'Physicist': { requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    'Chemist': { requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    'Music Producer': { requiredThemes: ['Music'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    'Marketing Manager': { requiredThemes: ['Business'], incompatibleThemes: [] },
    'Graphic Designer': { requiredThemes: ['Arts'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  };
  
  const careerData = CAREER_THEME_DATABASE[career];
  
  if (careerData) {
    careerData.requiredThemes.forEach(theme => {
      if (userThemes.includes(theme)) score += 25;
    });
    careerData.incompatibleThemes.forEach(theme => {
      if (userThemes.includes(theme)) score -= 30;
    });
  }
  
  return Math.max(10, Math.min(95, score));
};

export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  try {
    const educationLevel = extractEducationLevelFromDetails(input.userProfile);
    const themeResult = await extractCareerThemesEnhanced(input.userProfile, educationLevel);
    const userThemes = themeResult.themes;
    const themeConfidence = themeResult.confidence;
    console.log(`🎯 Theme extraction: ${themeResult.method} (confidence: ${themeConfidence})`);

    // Use fast model for initial quick check if it's a terrible match
    if (themeConfidence > 0.7 && userThemes.length > 0) {
      const quickCheckPrompt = `Quick check: Does career "${input.career}" fit themes: ${userThemes.join(', ')}?
    
User is ${educationLevel || 'student'}. Give brief yes/no with confidence (0-100).
Format: {"fit": true/false, "confidence": number, "reason": "one sentence"}`;
    
      const quickCheck = await callFastModelScopeAI(quickCheckPrompt);
      
      try {
        const jsonMatch = quickCheck.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const check = JSON.parse(jsonMatch[0]);
          if (check.confidence < 30 && check.fit === false) {
            // Very poor match - return early with fast model result
            return {
              explanation: `❌ Quick analysis shows poor fit. ${check.reason}`,
              skillMatch: 20,
              interestMatch: 15,
              valueAlignment: 25,
              overallScore: 20,
              themeMismatch: true,
              confidence: 'low',
              educationAlignment: 'poor',
              timeline: 'Not recommended',
              nextSteps: ['Consider other careers that match your themes']
            };
          }
        }
      } catch (e) {
        // Continue with full analysis if quick check fails
      }
    }

    const baseScore = calculateBaseScoreFromThemes(userThemes, input.career, input.careerCluster);
    
    const aiResult = await generateCareerMatchExplanationsFromModel(
      input.userProfile,
      input.career,
      input.careerDetails,
      userThemes,
      baseScore
    );

    return aiResult;
    
  } catch (error) {
    console.error('Error in generateCareerMatchExplanations:', error);
    // Re-throw the error to be handled by the client
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during career match generation.');
  }
}
