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
  educationLevel: z.enum(['highSchool', 'undergraduate', 'masters', 'phd', 'professional']).optional().describe('User education level for tailored analysis')
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

// FIX 1: Update career database with ALL 21 careers
const CAREER_THEME_DATABASE: Record<string, { requiredThemes: string[], incompatibleThemes: string[] }> = {
  // Original careers
  'Software Engineer': { requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
  'Cloud Architect': { requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
  'Data Scientist': { requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
  'Cybersecurity Analyst': { requiredThemes: ['Tech'], incompatibleThemes: ['Arts'] },
  'AI Researcher': { requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
  'Physicist': { requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business', 'Arts'] },
  'Chemist': { requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
  'Music Producer': { requiredThemes: ['Music'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
  'Marketing Manager': { requiredThemes: ['Business'], incompatibleThemes: [] },
  'Graphic Designer': { requiredThemes: ['Arts'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  'UI/UX Designer': { requiredThemes: ['Tech', 'Arts'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  
  // New careers
  'TikTok/Content Creator': { requiredThemes: ['Arts', 'Business'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  'Metaverse Developer': { requiredThemes: ['Tech', 'Arts'], incompatibleThemes: ['Music'] },
  'Ethical Hacker / Penetration Tester': { requiredThemes: ['Tech'], incompatibleThemes: ['Arts', 'Music'] },
  'Lawyer': { requiredThemes: ['Business', 'Law'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  'E-sports Coach/Manager': { requiredThemes: ['Sports', 'Business'], incompatibleThemes: [] },
  'Doctor': { requiredThemes: ['Healthcare', 'Science'], incompatibleThemes: ['Arts', 'Music'] },
  'Professor': { requiredThemes: ['Education', 'Science'], incompatibleThemes: [] },
  'Blockchain Developer': { requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
  'Architect': { requiredThemes: ['Arts', 'Engineering'], incompatibleThemes: ['Music'] },
  'Digital Marketing Specialist': { requiredThemes: ['Business', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
  'Psychologist': { requiredThemes: ['Healthcare', 'Science'], incompatibleThemes: [] }
};

const generateCareerMatchExplanationsFromModel = async (
  userProfile: string, 
  career: string, 
  careerDetails: string,
  userThemes: string[],
  baseScore: number,
  educationLevel?: string
): Promise<GenerateCareerMatchExplanationsOutput> => {
    
    // FIX 2: Add education level guidance to AI prompt
    const educationContext = educationLevel ? `Education Level: ${educationLevel}. ` : '';
    
    const prompt = `Analyze career fit for a user.

USER PROFILE (Themes: [${userThemes.join(', ')}]): ${userProfile}
${educationContext}CAREER: ${career}
CAREER DETAILS: ${careerDetails}

**EDUCATION LEVEL GUIDANCE:**
${educationLevel === 'highSchool' ? '- Focus on foundational skills, courses to take, and exploration activities' : ''}
${educationLevel === 'undergraduate' ? '- Focus on coursework, internships, and portfolio building' : ''}
${educationLevel === 'masters' ? '- Focus on specialization, research, and advanced certifications' : ''}
${educationLevel === 'phd' ? '- Focus on research directions, publications, and academic/industry positions' : ''}
${educationLevel === 'professional' ? '- Focus on skill gaps, certifications, and career transition strategies' : ''}

**SCORING CONSIDERATIONS:**
1. skillMatch (0-100): Current skill alignment.
2. interestMatch (0-100): Interest alignment.
3. valueAlignment (0-100): How well career fits personal values.

**BASE CALCULATION:** Start from a base score of ${baseScore}% (derived from theme match) and adjust based on the profile details.

Calculate: overallScore = (skillMatch * 0.5) + (interestMatch * 0.3) + (valueAlignment * 0.2)

**REQUIRED OUTPUT (JSON):**
{
  "explanation": "Detailed analysis of the match, tailored to their education level...",
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
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        // Basic validation
        if(parsed.overallScore) {
          return GenerateCareerMatchExplanationsOutputSchema.parse(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse AI response:', e);
      }
    }
  
  throw new Error("Failed to parse AI response for career match.");
};


// Local fast scoring function to avoid always returning 50%
const calculateBaseScoreFromThemes = (userThemes: string[], career: string, careerCluster?: string): number => {
  let score = 50; // Start at 50 but will be adjusted
  
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
    
    // FIX 3: Add bonus for partial matches (if user has related themes)
    const relatedThemes = {
      'Tech': ['Science', 'Engineering'],
      'Science': ['Tech', 'Healthcare'],
      'Arts': ['Design', 'Music'],
      'Business': ['Marketing', 'Finance'],
      'Healthcare': ['Science', 'Education'],
      'Education': ['Science', 'Healthcare'],
      'Law': ['Business', 'Education'],
      'Sports': ['Business', 'Health']
    };
    
    careerData.requiredThemes.forEach(requiredTheme => {
      const related = relatedThemes[requiredTheme as keyof typeof relatedThemes] || [];
      related.forEach(relatedTheme => {
        if (userThemes.includes(relatedTheme)) {
          score += 10; // Small bonus for related themes
        }
      });
    });
    
  } else {
    // FIX 4: Enhanced generic theme matching
    const careerLower = career.toLowerCase();
    
    // Tech careers
    if (careerLower.includes('software') || careerLower.includes('engineer') || careerLower.includes('developer') || 
        careerLower.includes('cloud') || careerLower.includes('cyber') || careerLower.includes('security') ||
        careerLower.includes('ai') || careerLower.includes('blockchain') || careerLower.includes('metaverse')) {
      if (userThemes.includes('Tech')) score += 30;
      if (userThemes.includes('Science')) score += 15;
      if (userThemes.includes('Music') || userThemes.includes('Arts')) score -= 20;
    }
    
    // Science careers
    else if (careerLower.includes('physics') || careerLower.includes('chem') || careerLower.includes('scientist') ||
             careerLower.includes('research') || careerLower.includes('lab') || careerLower.includes('psychologist')) {
      if (userThemes.includes('Science') || userThemes.includes('Physics') || userThemes.includes('Chemistry')) score += 30;
      if (userThemes.includes('Healthcare')) score += 15;
      if (userThemes.includes('Music') || userThemes.includes('Arts')) score -= 25;
    }
    
    // Arts/Creative careers
    else if (careerLower.includes('music') || careerLower.includes('audio') || careerLower.includes('art') || 
             careerLower.includes('design') || careerLower.includes('graphic') || careerLower.includes('content') ||
             careerLower.includes('tiktok')) {
      if (userThemes.includes('Arts') || userThemes.includes('Music')) score += 35;
      if (userThemes.includes('Tech')) score += 10; // Digital arts benefit from tech
      if (userThemes.includes('Science') || userThemes.includes('Physics') || userThemes.includes('Chemistry')) score -= 30;
    }
    
    // Business careers
    else if (careerLower.includes('business') || careerLower.includes('market') || careerLower.includes('finance') ||
             careerLower.includes('law') || careerLower.includes('lawyer') || careerLower.includes('digital marketing')) {
      if (userThemes.includes('Business')) score += 25;
      if (userThemes.includes('Law')) score += 20;
      if (userThemes.includes('Tech')) score += 10; // Digital marketing needs tech
    }
    
    // Healthcare careers
    else if (careerLower.includes('doctor') || careerLower.includes('nurse') || careerLower.includes('medical') ||
             careerLower.includes('health') || careerLower.includes('psychologist')) {
      if (userThemes.includes('Healthcare')) score += 30;
      if (userThemes.includes('Science')) score += 20;
      if (userThemes.includes('Arts')) score -= 10;
    }
    
    // Education careers
    else if (careerLower.includes('teacher') || careerLower.includes('professor') || careerLower.includes('education')) {
      if (userThemes.includes('Education')) score += 30;
      if (userThemes.includes('Science') || userThemes.includes('Arts')) score += 15;
    }
    
    // Sports careers
    else if (careerLower.includes('esports') || careerLower.includes('coach') || careerLower.includes('sports')) {
      if (userThemes.includes('Sports')) score += 30;
      if (userThemes.includes('Business')) score += 15;
    }
    
    // Architecture/Engineering
    else if (careerLower.includes('architect')) {
      if (userThemes.includes('Arts') && userThemes.includes('Engineering')) score += 35;
      if (userThemes.includes('Arts') || userThemes.includes('Engineering')) score += 20;
    }
  }
  
  // Adjust based on cluster if provided
  if (careerCluster) {
    const clusterThemes: Record<string, string[]> = {
      'Tech': ['Tech', 'Science'],
      'Science': ['Science', 'Physics', 'Chemistry'],
      'Arts': ['Arts', 'Music', 'Design'],
      'Business': ['Business', 'Marketing', 'Finance'],
      'Healthcare': ['Healthcare', 'Science'],
      'Education': ['Education'],
      'Law': ['Law', 'Business'],
      'Sports': ['Sports', 'Business'],
      'Engineering': ['Engineering', 'Tech']
    };
    
    const relevantThemes = clusterThemes[careerCluster] || [];
    if (userThemes.some(t => relevantThemes.includes(t))) {
      score += 15;
    }
  }
  
  // Ensure score is within reasonable bounds
  return Math.max(10, Math.min(95, Math.round(score)));
};

// Check for theme mismatches
const checkThemeMismatch = (userThemes: string[], career: string, careerCluster?: string): boolean => {
  const hardScienceThemes = ['Physics', 'Chemistry', 'Science'];
  const artsThemes = ['Music', 'Arts'];
  const techThemes = ['Tech', 'Engineering'];
  const businessThemes = ['Business', 'Law'];
  const healthcareThemes = ['Healthcare'];
  
  const userHasHardScience = userThemes.some(theme => hardScienceThemes.includes(theme));
  const userHasArts = userThemes.some(theme => artsThemes.includes(theme));
  const userHasTech = userThemes.some(theme => techThemes.includes(theme));
  const userHasBusiness = userThemes.some(theme => businessThemes.includes(theme));
  
  // Career name based checks
  const careerLower = career.toLowerCase();
  
  // Science vs Arts conflicts
  if ((careerLower.includes('physics') || careerLower.includes('chemistry') || careerLower.includes('scientist') ||
       careerLower.includes('doctor') || careerLower.includes('medical')) && userHasArts) {
    return true; // Arts background with science/medical career = mismatch
  }
  
  if ((careerLower.includes('music') || careerLower.includes('art') || careerLower.includes('design') ||
       careerLower.includes('tiktok') || careerLower.includes('content')) && userHasHardScience) {
    return true; // Science background with arts career = mismatch
  }
  
  // Tech vs Arts conflicts (less severe but still mismatches)
  if ((careerLower.includes('software') || careerLower.includes('developer') || careerLower.includes('cloud') ||
       careerLower.includes('cyber') || careerLower.includes('blockchain')) && userHasArts && !userHasTech) {
    return true; // Pure arts with tech career = mismatch
  }
  
  // Cluster based checks
  if (careerCluster) {
    const scienceClusters = ['Tech', 'Science', 'Physics', 'Chemistry', 'Healthcare'];
    const artsClusters = ['Music', 'Arts', 'Design'];
    
    if (scienceClusters.includes(careerCluster) && userHasArts && !userHasScience) {
      return true;
    }
    
    if (artsClusters.includes(careerCluster) && userHasHardScience && !userHasArts) {
      return true;
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
  const themeText = userThemes.length > 0 && userThemes[0] !== 'General' ? 
    `Your profile shows strong ${userThemes.join(' and ')} interests.` : 
    `Based on your diverse background.`;
  
  if (themeMismatch) {
    if (score < 30) {
      return `❌ **Major Theme Mismatch**: ${themeText} However, "${career}" requires different skills and interests. Consider exploring ${userThemes.join(' or ')}-focused careers for better alignment.`;
    } else {
      return `⚠️ **Partial Alignment**: ${themeText} While "${career}" has some overlap with your background, there may be significant gaps in required skills or daily activities. You might need to develop new skills to pursue this path.`;
    }
  }
  
  if (score >= 80) {
    return `🎯 **Excellent Match**: ${themeText} "${career}" aligns perfectly with your skills and interests. Your background provides a strong foundation for success in this field. This is an ideal career direction for you.`;
  } else if (score >= 60) {
    return `👍 **Good Match**: ${themeText} "${career}" is a solid choice that leverages many of your strengths. With some focused development in key areas, you could excel in this role.`;
  } else if (score >= 40) {
    return `🤔 **Moderate Match**: ${themeText} "${career}" has some alignment with your profile, but there are notable differences. Consider if this path truly aligns with your long-term goals, or if a related field might be a better fit.`;
  } else {
    return `📉 **Limited Match**: ${themeText} "${career}" shows limited alignment with your current profile. This might not be the most efficient path for leveraging your strengths. You might want to explore careers that better match your ${userThemes.join(' or ')} interests.`;
  }
};

export async function generateCareerMatchExplanations(
  input: GenerateCareerMatchExplanationsInput
): Promise<GenerateCareerMatchExplanationsOutput> {
  try {
    // Extract themes from user profile for dynamic scoring
    const userThemes = await extractCareerThemes({
      profile: input.userProfile,
      educationLevel: input.educationLevel
    });
    
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
        baseScore,
        input.educationLevel
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
      Math.max(10, Math.round(baseScore - 20)) : // Penalize for mismatches
      Math.round(baseScore);
    
    // Calculate component scores based on overall score
    const skillMatch = themeMismatch ? 
      Math.max(15, Math.min(100, Math.round(overallScore - 10))) : 
      Math.min(100, Math.round(overallScore + 5));
    
    const interestMatch = themeMismatch ? 
      Math.max(10, Math.min(100, Math.round(overallScore - 15))) : 
      Math.min(100, Math.round(overallScore));
    
    const valueAlignment = themeMismatch ? 
      Math.max(20, Math.min(100, Math.round(overallScore - 5))) : 
      Math.min(100, Math.round(overallScore + 10));
    
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
    const fallbackScore = Math.floor(Math.random() * 30) + 45; // Random 45-75% instead of fixed 50%
    
    return GenerateCareerMatchExplanationsOutputSchema.parse({
      explanation: `Based on your profile, "${input.career}" shows moderate alignment. Consider exploring this field further to determine if it matches your goals.`,
      skillMatch: fallbackScore,
      interestMatch: Math.max(30, fallbackScore - 10),
      valueAlignment: Math.min(90, fallbackScore + 5),
      overallScore: fallbackScore,
      themeMismatch: false,
      confidence: 'medium'
    });
  }
}