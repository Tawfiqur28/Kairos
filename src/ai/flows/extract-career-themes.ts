'use server';
/**
 * @fileOverview Extracts career themes from a user's Ikigai profile.
 */

import { z } from 'zod';
import { callFastModelScopeAI } from '@/ai/utils';

// Local keyword detection function (fallback)
const detectScienceThemesFromKeywords = (profile: string): string[] => {
  const lowerProfile = profile.toLowerCase();
  const themes: string[] = [];
  
  const keywordMap: Record<string, string[]> = {
    Tech: ['code', 'programming', 'computer', 'software', 'developer', 'engineer', 'python', 'java', 'javascript', 'tech', 'ai', 'machine learning', 'data', 'algorithm', 'web', 'app', 'mobile'],
    Physics: ['physics', 'quantum', 'relativity', 'astronomy', 'space', 'energy', 'force', 'motion', 'thermodynamics', 'particle', 'nuclear', 'mechanics', 'electromagnetism'],
    Chemistry: ['chemistry', 'chemical', 'molecule', 'atom', 'reaction', 'lab', 'organic', 'inorganic', 'biochemistry', 'compound', 'element', 'periodic table', 'synthesis'],
    Science: ['biology', 'research', 'experiment', 'scientific', 'lab work', 'analysis', 'genetics', 'microbiology', 'environmental', 'biomedical', 'neuroscience'],
    Music: ['music', 'song', 'instrument', 'guitar', 'piano', 'producer', 'sound', 'audio', 'band', 'concert', 'sing', 'compose', 'melody', 'rhythm', 'dj', 'recording'],
    Business: ['business', 'market', 'finance', 'management', 'entrepreneur', 'startup', 'sales', 'investment', 'marketing', 'strategy', 'consulting'],
    Arts: ['art', 'design', 'creative', 'drawing', 'painting', 'visual', 'graphic', 'ui/ux', 'illustration', 'photography', 'animation'],
    Education: ['teach', 'teacher', 'education', 'learn', 'student', 'professor', 'tutor', 'instruction', 'curriculum'],
    Healthcare: ['health', 'medical', 'doctor', 'nurse', 'patient', 'therapy', 'medicine', 'hospital', 'clinic', 'wellness']
  };
  
  const themeCounts: Record<string, number> = {};
  
  Object.entries(keywordMap).forEach(([theme, keywords]) => {
    const count = keywords.filter(keyword => lowerProfile.includes(keyword)).length;
    if (count > 0) {
      themeCounts[theme] = count;
    }
  });
  
  Object.entries(themeCounts).forEach(([theme, count]) => {
    if (count >= 2) {
      themes.push(theme);
    } else if (count === 1 && themeCounts[theme] > 0) {
      const strongIndicators = ['doctor', 'engineer', 'programming', 'physics', 'chemistry', 'artist', 'musician'];
      const hasStrongIndicator = keywordMap[theme].some(keyword => 
        strongIndicators.includes(keyword) && lowerProfile.includes(keyword)
      );
      if (hasStrongIndicator) {
        themes.push(theme);
      }
    }
  });
  
  const hasHardScience = themes.some(theme => ['Physics', 'Chemistry', 'Science'].includes(theme));
  const hasArts = themes.some(theme => ['Music', 'Arts'].includes(theme));
  
  if (hasHardScience && hasArts) {
    const filtered = themes.filter(theme => {
      if (['Music', 'Arts'].includes(theme)) {
        return themeCounts[theme] >= 3;
      }
      return true;
    });
    return filtered.length > 0 ? filtered : themes;
  }
  
  return themes.length > 0 ? themes : ['General'];
};

// ==================== ENHANCED THEME EXTRACTION WITH FAST MODEL ====================
export const extractCareerThemesEnhanced = async (
  userProfile: string,
  educationLevel?: string
): Promise<{ themes: string[], confidence: number, method: 'ai' | 'keyword' }> => {
  
  // Try FAST AI model first
  const prompt = `Extract career themes from: "${userProfile}"
  
Education Level: ${educationLevel || 'Not specified'}

Respond with ONLY a JSON array of themes from this list:
["Tech", "Physics", "Chemistry", "Science", "Music", "Business", "Arts", "Healthcare", "Education"]

Example: ["Tech", "Business"] or ["Physics"]`;

  const aiResponse = await callFastModelScopeAI(prompt);
  
  if (aiResponse && !aiResponse.startsWith('ERROR')) {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const themes = JSON.parse(jsonMatch[0]);
        if (Array.isArray(themes) && themes.length > 0) {
          console.log(`✅ AI themes extracted: ${themes.join(', ')}`);
          return {
            themes,
            confidence: 0.9,
            method: 'ai'
          };
        }
      }
    } catch (e) {
      console.warn('AI theme parse failed, falling back to keywords');
    }
  }
  
  // Fallback to keyword detection
  const keywordThemes = detectScienceThemesFromKeywords(userProfile);
  return {
    themes: keywordThemes,
    confidence: 0.6,
    method: 'keyword'
  };
};

const ExtractCareerThemesInputSchema = z.object({
  profile: z.string().min(10, 'Profile must be at least 10 characters').describe('The user\'s Ikigai profile text'),
  educationLevel: z.string().optional()
}).or(z.string().min(10, 'Profile must be at least 10 characters')).describe('Either a string profile or an object with profile and options');

export type ExtractCareerThemesInput = z.infer<typeof ExtractCareerThemesInputSchema>;

const ExtractCareerThemesOutputSchema = z.array(z.string()).describe('An array of career theme strings, e.g., ["Tech", "Arts"]');
export type ExtractCareerThemesOutput = z.infer<typeof ExtractCareerThemesOutputSchema>;


export async function extractCareerThemes(
  input: ExtractCareerThemesInput
): Promise<ExtractCareerThemesOutput> {
  try {
    const parsedInput = ExtractCareerThemesInputSchema.parse(input);
    
    let profileText: string;
    let educationLevel: string | undefined;
    
    if (typeof parsedInput === 'string') {
      profileText = parsedInput;
    } else {
      profileText = parsedInput.profile;
      educationLevel = parsedInput.educationLevel;
    }
    
    if (!profileText || profileText.trim().length < 10) {
      throw new Error('Profile text is too short or empty');
    }
    
    const { themes } = await extractCareerThemesEnhanced(profileText, educationLevel);
    
    const validThemes = ['Tech', 'Physics', 'Chemistry', 'Science', 'Music', 'Business', 'Arts', 'Education', 'Healthcare', 'General'];
    const filteredThemes = themes.filter(theme => validThemes.includes(theme));
    
    return ExtractCareerThemesOutputSchema.parse(filteredThemes.length > 0 ? filteredThemes : ['General']);
    
  } catch (error) {
    console.error('Error in extractCareerThemes:', error);
    
    if (error instanceof z.ZodError) {
      throw new Error(`Input validation failed: ${error.errors.map(e => `${e.path}: ${e.message}`).join(', ')}`);
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to extract career themes: ${error.message}`);
    }
    
    throw new Error('Failed to extract career themes due to an unknown error');
  }
}
