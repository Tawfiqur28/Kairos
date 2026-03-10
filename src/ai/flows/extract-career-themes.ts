'use server';
/**
 * @fileOverview Extracts career themes from a user's Ikigai profile.
 */

import { z } from 'zod';
import { callModelScopeAI } from '@/ai/utils';

// Local keyword detection function (fallback)
const detectCareerThemesFromKeywords = (profile: string): string[] => {
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
    Healthcare: ['health', 'medical', 'doctor', 'nurse', 'patient', 'therapy', 'medicine', 'hospital', 'clinic', 'wellness'],
    // FIX 1: Add missing themes from your 21 careers
    Law: ['law', 'lawyer', 'attorney', 'legal', 'court', 'case', 'litigation', 'contract'],
    Sports: ['esports', 'gaming', 'coach', 'athlete', 'sports', 'tournament', 'competitive'],
    Engineering: ['civil', 'mechanical', 'electrical', 'structural', 'autocad', 'revit', 'architecture']
  };
  
  const themeCounts: Record<string, number> = {};
  
  // Count keyword matches for each theme
  Object.entries(keywordMap).forEach(([theme, keywords]) => {
    const count = keywords.filter(keyword => lowerProfile.includes(keyword)).length;
    if (count > 0) {
      themeCounts[theme] = count;
    }
  });
  
  // Add themes with significant keyword presence (at least 2 matches or strong single match)
  Object.entries(themeCounts).forEach(([theme, count]) => {
    if (count >= 2) {
      themes.push(theme);
    } else if (count === 1 && themeCounts[theme] > 0) {
      // For single matches, check if it's a strong indicator
      const strongIndicators = ['doctor', 'engineer', 'programming', 'physics', 'chemistry', 'artist', 'musician', 'lawyer', 'teacher', 'nurse', 'architect'];
      const hasStrongIndicator = keywordMap[theme].some(keyword => 
        strongIndicators.includes(keyword) && lowerProfile.includes(keyword)
      );
      if (hasStrongIndicator) {
        themes.push(theme);
      }
    }
  });
  
  // Filter incompatible themes (science vs arts)
  const hasHardScience = themes.some(theme => ['Physics', 'Chemistry', 'Science'].includes(theme));
  const hasArts = themes.some(theme => ['Music', 'Arts'].includes(theme));
  const hasBusiness = themes.some(theme => ['Business'].includes(theme));
  const hasHealthcare = themes.some(theme => ['Healthcare'].includes(theme));
  
  if (hasHardScience && hasArts) {
    // Keep the strongest themes based on keyword count
    const filtered = themes.filter(theme => {
      if (['Music', 'Arts'].includes(theme)) {
        return themeCounts[theme] >= 3; // Only keep arts if very strong
      }
      return true;
    });
    return filtered.length > 0 ? filtered : themes;
  }
  
  return themes.length > 0 ? themes : ['General']; // Default theme if none detected
};

// FIX 2: Update valid themes to match your 21 careers
const VALID_THEMES = ['Tech', 'Physics', 'Chemistry', 'Science', 'Music', 'Business', 'Arts', 'Education', 'Healthcare', 'Law', 'Sports', 'Engineering', 'General'];

const ExtractCareerThemesInputSchema = z.object({
  profile: z.string().min(10, 'Profile must be at least 10 characters').describe('The user\'s Ikigai profile text'),
  educationLevel: z.enum(['highSchool', 'undergraduate', 'masters', 'phd', 'professional']).optional().describe('User\'s education level for contextual analysis'),
  useFastMethod: z.boolean().optional().default(true).describe('Use fast keyword detection instead of AI model')
}).or(z.string().min(10, 'Profile must be at least 10 characters')).describe('Either a string profile or an object with profile and options');

export type ExtractCareerThemesInput = z.infer<typeof ExtractCareerThemesInputSchema>;

const ExtractCareerThemesOutputSchema = z.array(z.string()).describe('An array of career theme strings, e.g., ["Tech", "Arts"]');
export type ExtractCareerThemesOutput = z.infer<typeof ExtractCareerThemesOutputSchema>;

// FIX 3: Improved AI prompt with better context
const extractCareerThemesFromModel = async (userProfile: string, educationLevel?: string): Promise<string[]> => {
  const educationContext = educationLevel ? `Education Level: ${educationLevel}. ` : '';
  
  // Map education level to descriptive text
  const educationLevelMap: Record<string, string> = {
    highSchool: 'High School Student - focusing on exploration and foundation',
    undergraduate: 'Undergraduate Student - building core skills and knowledge',
    masters: 'Master\'s Student - specializing and deepening expertise',
    phd: 'PhD/Doctoral Candidate - conducting original research',
    professional: 'Working Professional - advancing career or considering transition'
  };
  
  const educationDescription = educationLevel && educationLevelMap[educationLevel] 
    ? `Context: ${educationLevelMap[educationLevel]}. ` 
    : '';
  
  const prompt = `Analyze this user's profile to identify their dominant career themes.

${educationContext}${educationDescription}User Profile: "${userProfile}"

Available themes: ["Tech", "Physics", "Chemistry", "Science", "Music", "Business", "Arts", "Education", "Healthcare", "Law", "Sports", "Engineering"]

**IMPORTANT GUIDELINES:**
- Return ONLY the themes that are STRONGLY represented in their profile
- Consider their education level for context (e.g., PhD student likely has research focus)
- Look for keywords and interests that align with each theme
- Return 1-3 themes maximum, not all possible themes

Respond ONLY with a JSON array. Examples:
- For someone interested in coding and building apps: ["Tech"]
- For someone interested in both science and music: ["Science", "Music"]
- For someone with healthcare and education interests: ["Healthcare", "Education"]`;

  const response = await callModelScopeAI(prompt, 'qwen-max');
  
  if (response.startsWith('ERROR:')) {
    throw new Error(response);
  }
  
  try {
    // Try to extract JSON array from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if(Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        // Validate themes against valid list
        const validThemes = parsed.filter(theme => VALID_THEMES.includes(theme));
        return validThemes.length > 0 ? validThemes : [];
      }
    }
  } catch (e) {
    console.warn('Theme extraction JSON parse failed:', e);
    // Fallback to keyword detection below
  }
  
  return detectCareerThemesFromKeywords(userProfile);
};

export async function extractCareerThemes(
  input: ExtractCareerThemesInput
): Promise<ExtractCareerThemesOutput> {
  try {
    // Parse and validate input
    const parsedInput = ExtractCareerThemesInputSchema.parse(input);
    
    let profileText: string;
    let educationLevel: string | undefined;
    let useFastMethod: boolean;
    
    if (typeof parsedInput === 'string') {
      profileText = parsedInput;
      educationLevel = undefined;
      useFastMethod = true; // Default to fast method for string input
    } else {
      profileText = parsedInput.profile;
      educationLevel = parsedInput.educationLevel;
      useFastMethod = parsedInput.useFastMethod ?? true;
    }
    
    if (!profileText || profileText.trim().length < 10) {
      throw new Error('Profile text is too short or empty');
    }
    
    let result: string[];
    
    if (useFastMethod) {
      // Use local keyword detection (fast)
      result = detectCareerThemesFromKeywords(profileText);
    } else {
      try {
        // Try AI model extraction with education context
        result = await extractCareerThemesFromModel(profileText, educationLevel);
        
        // Validate AI output
        if (!Array.isArray(result) || result.length === 0) {
          result = detectCareerThemesFromKeywords(profileText);
        }
      } catch (aiError) {
        console.warn('AI theme extraction failed, falling back to keyword detection:', aiError);
        result = detectCareerThemesFromKeywords(profileText);
      }
    }
    
    // Ensure we always have at least one theme
    if (!result || result.length === 0) {
      result = ['General'];
    }
    
    // Remove duplicates
    const uniqueThemes = [...new Set(result)];
    
    // Validate against expected themes
    const filteredThemes = uniqueThemes.filter(theme => VALID_THEMES.includes(theme));
    
    // FIX 4: Log for debugging
    console.log(`Extracted themes for profile: ${filteredThemes.length > 0 ? filteredThemes.join(', ') : 'General'}`);
    
    // Return validated output
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

// Export the fast detection function for direct use
export { detectCareerThemesFromKeywords };