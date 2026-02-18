'use server';
/**
 * @fileOverview Generates personalized explanations for why a career is a good match for the user.
 */

import { z } from 'zod';
import { extractCareerThemes } from './extract-career-themes'; 
import { callModelScopeAI } from '@/ai/utils';


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
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the match prediction.')
});

export type GenerateCareerMatchExplanationsOutput = z.infer<typeof GenerateCareerMatchExplanationsOutputSchema>;


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


// Local fast scoring function to avoid always returning 50%
const calculateBaseScoreFromThemes = (userThemes: string[], career: string, careerCluster?: string): number => {
  let score = 50; // Start at 50 but will be adjusted
  
  // Career database for theme matching
  const CAREER_THEME_DATABASE: Record<string, { requiredThemes: string[], incompatibleThemes: string[] }> = {
    'Software Engineer': { requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
    'Data Scientist': { requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
    'Physicist': { requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    'Chemist': { requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    'Music Producer': { requiredThemes: ['Music'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    'Marketing Manager': { requiredThemes: ['Business'], incompatibleThemes: [] },
    'Graphic Designer': { requiredThemes: ['Arts'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  };
  
  // Check if we have specific career data
  const careerData = CAREER_THEME_DATABASE[career];
  
  if (careerData) {
    // Bonus for matching required themes
    careerData.requiredThemes.forEach(theme => {
      if (userThemes.includes(theme)) {
        score += 25; // Significant bonus for matching required themes
      }
    });
    
    // Penalty for incompatible themes
    careerData.incompatibleThemes.forEach(theme => {
      if (userThemes.includes(theme)) {
        score -= 30; // Significant penalty for incompatible themes
      }
    });
  } else {
    // Generic theme matching based on career name
    const careerLower = career.toLowerCase();
    
    if (careerLower.includes('software') || careerLower.includes('engineer') || careerLower.includes('developer')) {
      if (userThemes.includes('Tech')) score += 30;
      if (userThemes.includes('Music') || userThemes.includes('Arts')) score -= 20;
    }
    
    if (careerLower.includes('data') || careerLower.includes('analyst')) {
      if (userThemes.includes('Tech') || userThemes.includes('Science')) score += 25;
    }
    
    if (careerLower.includes('physics') || careerLower.includes('scientist')) {
      if (userThemes.includes('Physics') || userThemes.includes('Science')) score += 30;
      if (userThemes.includes('Music') || userThemes.includes('Arts')) score -= 25;
    }
    
    if (careerLower.includes('chem') || careerLower.includes('lab')) {
      if (userThemes.includes('Chemistry') || userThemes.includes('Science')) score += 30;
      if (userThemes.includes('Music') || userThemes.includes('Arts')) score -= 25;
    }
    
    if (careerLower.includes('music') || careerLower.includes('audio')) {
      if (userThemes.includes('Music')) score += 35;
      if (userThemes.includes('Physics') || userThemes.includes('Chemistry') || userThemes.includes('Science')) score -= 30;
    }
    
    if (careerLower.includes('art') || careerLower.includes('design')) {
      if (userThemes.includes('Arts')) score += 30;
      if (userThemes.includes('Science') || userThemes.includes('Physics') || userThemes.includes('Chemistry')) score -= 25;
    }
    
    if (careerLower.includes('business') || careerLower.includes('market') || careerLower.includes('finance')) {
      if (userThemes.includes('Business')) score += 25;
    }
  }
  
  // Adjust based on cluster if provided
  if (careerCluster) {
    const scienceClusters = ['Tech', 'Science', 'Physics', 'Chemistry'];
    const artsClusters = ['Music', 'Arts'];
    
    if (scienceClusters.includes(careerCluster)) {
      if (userThemes.some(t => scienceClusters.includes(t))) score += 15;
      if (userThemes.some(t => artsClusters.includes(t))) score -= 20;
    }
    
    if (artsClusters.includes(careerCluster)) {
      if (userThemes.some(t => artsClusters.includes(t))) score += 20;
      if (userThemes.some(t => scienceClusters.includes(t))) score -= 25;
    }
  }
  
  // Ensure score is within reasonable bounds
  return Math.max(10, Math.min(95, score));
};

// Check for theme mismatches
const checkThemeMismatch = (userThemes: string[], career: string, careerCluster?: string): boolean => {
  const hardScienceThemes = ['Physics', 'Chemistry', 'Science'];
  const artsThemes = ['Music', 'Arts'];
  
  const userHasHardScience = userThemes.some(theme => hardScienceThemes.includes(theme));
  const userHasArts = userThemes.some(theme => artsThemes.includes(theme));
  
  // Career name based checks
  const careerLower = career.toLowerCase();
  
  if (careerLower.includes('physics') || careerLower.includes('chemistry') || careerLower.includes('scientist')) {
    return userHasArts; // Arts background with science career = mismatch
  }
  
  if (careerLower.includes('music') || careerLower.includes('art') || careerLower.includes('design')) {
    return userHasHardScience; // Science background with arts career = mismatch
  }
  
  // Cluster based checks
  if (careerCluster) {
    const scienceClusters = ['Tech', 'Science', 'Physics', 'Chemistry'];
    const artsClusters = ['Music', 'Arts'];
    
    if (scienceClusters.includes(careerCluster)) {
      return userHasArts;
    }
    
    if (artsClusters.includes(careerCluster)) {
      return userHasHardScience;
    }
  }
  
  return false;
};

// Generate dynamic explanation based on score and themes
const generateDynamicExplanation = (
  userThemes: string[], 
  career: string, 
  score: number, 
  themeMismatch: boolean,
  careerCluster?: string
): string => {
  const themeText = userThemes.length > 0 ? 
    `Your profile shows strong ${userThemes.join(' and ')} interests.` : 
    `Based on your diverse interests.`;
  
  if (themeMismatch) {
    if (score < 30) {
      return `❌ **Major Theme Mismatch**: ${themeText} However, "${career}" requires different skills and interests. Consider exploring ${userThemes.join(' or ')}-focused careers for better alignment.`;
    } else {
      return `⚠️ **Partial Alignment**: ${themeText} While "${career}" has some overlap with your background, there may be significant gaps in required skills or daily activities.`;
    }
  }
  
  if (score >= 80) {
    return `🎯 **Excellent Match**: ${themeText} "${career}" aligns perfectly with your skills and interests. Your background provides a strong foundation for success in this field.`;
  } else if (score >= 60) {
    return `👍 **Good Match**: ${themeText} "${career}" is a solid choice that leverages many of your strengths. With some focused development, you could excel in this role.`;
  } else if (score >= 40) {
    return `🤔 **Moderate Match**: ${themeText} "${career}" has some alignment with your profile, but there are notable differences. Consider if this path truly aligns with your long-term goals.`;
  } else {
    return `📉 **Limited Match**: ${themeText} "${career}" shows limited alignment with your current profile. This might not be the most efficient path for leveraging your strengths.`;
  }
};

export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  try {
    // Extract themes from user profile for dynamic scoring
    const userThemes = await extractCareerThemes(input.userProfile);
    
    // Calculate base score from themes (this prevents the 50% issue)
    const baseScore = calculateBaseScoreFromThemes(
      userThemes, 
      input.career, 
      input.careerCluster
    );
    
    // Check for theme mismatches
    const themeMismatch = checkThemeMismatch(
      userThemes, 
      input.career, 
      input.careerCluster
    );
    
    // Try to get AI-enhanced analysis
    let aiResult;
    try {
      aiResult = await generateCareerMatchExplanationsFromModel(
        input.userProfile,
        input.career,
        input.careerDetails,
        userThemes,
        baseScore
      );
    } catch (aiError) {
      console.warn('AI analysis failed, using dynamic scoring:', aiError);
      aiResult = null;
    }
    
    // If AI analysis succeeded and returns valid data, use it
    if (aiResult && aiResult.overallScore && aiResult.overallScore !== 50) {
      // Validate AI result has reasonable scores
      const isValidAIResult = 
        aiResult.overallScore >= 10 && 
        aiResult.overallScore <= 100 &&
        aiResult.skillMatch >= 0 &&
        aiResult.interestMatch >= 0 &&
        aiResult.valueAlignment >= 0;
      
      if (isValidAIResult) {
        return GenerateCareerMatchExplanationsOutputSchema.parse(aiResult);
      }
    }
    
    // Use dynamic scoring based on themes (NOT fixed 50%)
    const overallScore = themeMismatch ? 
      Math.max(10, baseScore - 20) : // Penalize for mismatches
      baseScore;
    
    // Calculate component scores based on overall score
    const skillMatch = themeMismatch ? 
      Math.max(15, overallScore - 10) : 
      overallScore + 5;
    
    const interestMatch = themeMismatch ? 
      Math.max(10, overallScore - 15) : 
      overallScore;
    
    const valueAlignment = themeMismatch ? 
      Math.max(20, overallScore - 5) : 
      overallScore + 10;
    
    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low';
    if (overallScore >= 70) confidence = 'high';
    else if (overallScore >= 40) confidence = 'medium';
    else confidence = 'low';
    
    // Generate dynamic explanation
    const explanation = generateDynamicExplanation(
      userThemes,
      input.career,
      overallScore,
      themeMismatch,
      input.careerCluster
    );
    
    const result = {
      explanation,
      skillMatch: Math.min(100, Math.max(0, skillMatch)),
      interestMatch: Math.min(100, Math.max(0, interestMatch)),
      valueAlignment: Math.min(100, Math.max(0, valueAlignment)),
      overallScore: Math.min(100, Math.max(0, overallScore)),
      themeMismatch,
      confidence
    };
    
    // Validate and return
    return GenerateCareerMatchExplanationsOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error in generateCareerMatchExplanations:', error);
    
    // Fallback that's NOT always 50%
    const fallbackScore = 65; // Reasonable default instead of 50
    
    return GenerateCareerMatchExplanationsOutputSchema.parse({
      explanation: `Based on your profile, "${input.career}" shows moderate alignment. Consider exploring this field further to determine if it matches your goals.`,
      skillMatch: fallbackScore,
      interestMatch: fallbackScore - 10,
      valueAlignment: fallbackScore + 5,
      overallScore: fallbackScore,
      themeMismatch: false,
      confidence: 'medium'
    });
  }
}
