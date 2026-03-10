'use server';

/**
 * @fileOverview Analyzes user journal entries to provide career suggestions based on their daily feelings.
 */

import { z } from 'zod';
import { callModelScopeAI } from '@/ai/utils';


const JournalEntryInputSchema = z.object({
  journalEntries: z.string()
    .min(10, 'Journal entries must be at least 10 characters')
    .max(5000, 'Journal entries are too long')
    .describe('A collection of journal entries from the user.'),
  feelings: z.string()
    .min(5, 'Feelings description must be at least 5 characters')
    .max(1000, 'Feelings description is too long')
    .describe('A description of the user\'s daily feelings.'),
  useAIFallback: z.boolean().optional().default(true)
    .describe('Use AI as fallback if local analysis fails'),
});
export type JournalEntryInput = z.infer<typeof JournalEntryInputSchema>;

const CareerSuggestionsOutputSchema = z.object({
  careerSuggestions: z.string().describe('A list of career suggestions based on the journal entries and feelings.'),
  analysis: z.string().describe('An analysis of the journal entries and feelings.'),
  confidence: z.enum(['high', 'medium', 'low']).optional()
    .describe('Confidence level of the analysis'),
  themes: z.array(z.string()).optional()
    .describe('Key themes identified in the journal'),
  topMatches: z.array(z.string()).optional()
    .describe('Top 3 career matches with scores'),
  success: z.boolean().optional()
    .describe('Whether the analysis was successful'),
});
export type CareerSuggestionsOutput = z.infer<typeof CareerSuggestionsOutputSchema>;

// FIX 1: Enhanced AI prompt with better career matching
const processJournalEntriesFromModel = async (journalEntries: string, feelings: string): Promise<CareerSuggestionsOutput> => {
    const prompt = `You are a career psychologist analyzing journal entries to suggest suitable career paths.

Journal Entries:
"${journalEntries}"

Feelings:
"${feelings}"

**ANALYSIS GUIDELINES:**
1. Identify recurring themes, activities, and emotional patterns
2. Connect these to specific career fields from this list: 
   Software Engineer, Cloud Architect, Data Scientist, Cybersecurity Analyst, AI Researcher, 
   Physicist, Chemist, Music Producer, Marketing Manager, Graphic Designer, UI/UX Designer,
   TikTok/Content Creator, Metaverse Developer, Ethical Hacker, Lawyer, E-sports Coach, 
   Doctor, Professor, Blockchain Developer, Architect, Digital Marketing Specialist, Psychologist

3. Consider the user's emotional state:
   - Positive emotions around certain activities suggest passion areas
   - Negative emotions around activities suggest areas to avoid
   - Challenges mentioned indicate problem-solving preferences

4. Provide a thoughtful analysis and suggest 5 careers that would be a good fit.

**RESPONSE FORMAT (JSON ONLY):**
{
  "analysis": "Based on your journal entries, you seem to enjoy [patterns]. You feel most engaged when [situations]. Your writing suggests you value [values].",
  "careerSuggestions": "1. Career 1 - Why it fits\n2. Career 2 - Why it fits\n3. Career 3 - Why it fits\n4. Career 4 - Why it fits\n5. Career 5 - Why it fits",
  "themes": ["theme1", "theme2", "theme3"],
  "topMatches": ["Career 1", "Career 2", "Career 3"]
}`;

    const response = await callModelScopeAI(prompt, 'qwen-max');

    if (response.startsWith('ERROR:')) {
        throw new Error(response);
    }
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.analysis && parsed.careerSuggestions) {
                return CareerSuggestionsOutputSchema.parse({
                    ...parsed,
                    confidence: 'high',
                    success: true
                });
            }
        } catch (e) {
            console.warn('Failed to parse AI response:', e);
        }
    }

    throw new Error('Failed to parse AI response for journal analysis.');
};

// FIX 2: Enhanced local analysis with ALL 21 careers
const analyzeJournalEntriesLocally = (
  journalEntries: string,
  feelings: string
): CareerSuggestionsOutput => {
  const text = `${journalEntries} ${feelings}`.toLowerCase();
  
  // Theme detection from keywords
  const themes: string[] = [];
  const themeScores: Record<string, number> = {};
  
  // Define theme keywords (expanded)
  const themeKeywords: Record<string, string[]> = {
    creative: ['create', 'design', 'art', 'draw', 'paint', 'write', 'compose', 'imagine', 'innovate', 'invent', 'creative', 'make', 'build'],
    technical: ['code', 'program', 'build', 'solve', 'technical', 'engineer', 'develop', 'algorithm', 'data', 'system', 'computer', 'software'],
    analytical: ['analyze', 'research', 'study', 'examine', 'investigate', 'statistics', 'data', 'patterns', 'logic', 'math', 'calculate'],
    social: ['help', 'people', 'team', 'communicate', 'teach', 'guide', 'support', 'listen', 'collaborate', 'community'],
    organized: ['plan', 'organize', 'manage', 'schedule', 'system', 'efficient', 'structure', 'order', 'process'],
    outdoors: ['nature', 'outside', 'physical', 'active', 'exercise', 'travel', 'explore', 'adventure', 'environment'],
    detail: ['detail', 'precise', 'accurate', 'meticulous', 'careful', 'thorough', 'perfection', 'quality'],
    leadership: ['lead', 'manage', 'direct', 'strategize', 'decision', 'vision', 'motivate', 'inspire', 'guide'],
    independent: ['alone', 'solo', 'independent', 'autonomous', 'self-directed', 'individual', 'own boss'],
    healthcare: ['health', 'medical', 'care', 'patient', 'doctor', 'nurse', 'therapy', 'heal', 'wellness'],
    business: ['business', 'market', 'sales', 'finance', 'money', 'entrepreneur', 'startup', 'profit', 'invest'],
    science: ['science', 'lab', 'experiment', 'research', 'biology', 'chemistry', 'physics', 'discovery'],
    education: ['teach', 'learn', 'education', 'school', 'student', 'study', 'knowledge', 'mentor'],
    gaming: ['game', 'gaming', 'esports', 'play', 'competition', 'tournament', 'strategy', 'win'],
    law: ['law', 'legal', 'justice', 'rights', 'argue', 'debate', 'court', 'policy']
  };
  
  // Calculate theme scores
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (text.match(regex) || []).length;
      score += matches;
    });
    if (score > 0) {
      themeScores[theme] = score;
      if (score >= 2) {
        themes.push(theme);
      }
    }
  });
  
  // Sort themes by score (highest first)
  const sortedThemes = Object.entries(themeScores)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme);
  
  // Detect emotional tone with better analysis
  const positiveWords = ['happy', 'excited', 'fulfilled', 'satisfied', 'proud', 'joy', 'love', 'passion', 'grateful', 'accomplished'];
  const negativeWords = ['stress', 'anxious', 'worried', 'frustrated', 'bored', 'tired', 'overwhelmed', 'sad', 'angry', 'disappointed'];
  const challengeWords = ['challenge', 'difficult', 'hard', 'struggle', 'problem', 'obstacle', 'complex', 'puzzle'];
  const achievementWords = ['solved', 'completed', 'achieved', 'won', 'success', 'progress', 'improved', 'learned'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let challengeCount = 0;
  let achievementCount = 0;
  
  positiveWords.forEach(word => { 
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    positiveCount += (text.match(regex) || []).length;
  });
  
  negativeWords.forEach(word => { 
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    negativeCount += (text.match(regex) || []).length;
  });
  
  challengeWords.forEach(word => { 
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    challengeCount += (text.match(regex) || []).length;
  });
  
  achievementWords.forEach(word => { 
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    achievementCount += (text.match(regex) || []).length;
  });
  
  let emotionalTone = 'neutral';
  if (positiveCount > negativeCount + 2) emotionalTone = 'positive';
  else if (negativeCount > positiveCount + 2) emotionalTone = 'negative';
  
  // Generate career suggestions based on themes (UPDATED with ALL 21 careers)
  const careerSuggestionsMap: Record<string, string[]> = {
    creative: ['Graphic Designer', 'UI/UX Designer', 'Content Creator', 'TikTok Creator', 'Architect', 'Music Producer', 'Artist'],
    technical: ['Software Engineer', 'Cloud Architect', 'Data Scientist', 'Cybersecurity Analyst', 'AI Researcher', 'Blockchain Developer', 'Metaverse Developer'],
    analytical: ['Data Scientist', 'Research Scientist', 'Financial Analyst', 'Physicist', 'Chemist', 'AI Researcher'],
    social: ['Psychologist', 'Doctor', 'Professor', 'Teacher', 'Counselor', 'Human Resources', 'Lawyer'],
    organized: ['Project Manager', 'Marketing Manager', 'Operations Manager', 'Digital Marketing Specialist', 'Event Planner'],
    outdoors: ['Environmental Scientist', 'Architect', 'Park Ranger', 'Tour Guide'],
    detail: ['Cybersecurity Analyst', 'Quality Assurance', 'Editor', 'Accountant', 'Ethical Hacker'],
    leadership: ['Marketing Manager', 'Professor', 'E-sports Coach', 'Department Manager', 'Entrepreneur'],
    independent: ['Freelancer', 'Consultant', 'Content Creator', 'Researcher', 'Artist'],
    healthcare: ['Doctor', 'Psychologist', 'Nurse', 'Therapist', 'Medical Researcher'],
    business: ['Marketing Manager', 'Digital Marketing Specialist', 'Financial Analyst', 'Entrepreneur', 'Business Consultant'],
    science: ['Physicist', 'Chemist', 'Research Scientist', 'Data Scientist', 'Environmental Scientist'],
    education: ['Professor', 'Teacher', 'Educational Consultant', 'Curriculum Developer'],
    gaming: ['E-sports Coach', 'Game Developer', 'Metaverse Developer', 'Content Creator'],
    law: ['Lawyer', 'Legal Consultant', 'Policy Advisor', 'Compliance Officer']
  };
  
  // Generate suggestions with weights
  let careerScores: Record<string, number> = {};
  
  sortedThemes.forEach((theme, index) => {
    const weight = sortedThemes.length - index; // Higher weight for top themes
    if (careerSuggestionsMap[theme]) {
      careerSuggestionsMap[theme].forEach(career => {
        careerScores[career] = (careerScores[career] || 0) + weight;
      });
    }
  });
  
  // Sort careers by score and get top 5
  const topCareers = Object.entries(careerScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([career]) => career);
  
  // Get top 3 matches for the response
  const topMatches = topCareers.slice(0, 3);
  
  // If no themes detected, use fallback
  if (topCareers.length === 0) {
    topCareers.push(
      'Project Manager',
      'Business Analyst', 
      'Marketing Specialist',
      'Customer Service Representative',
      'Administrative Assistant'
    );
  }
  
  // Generate analysis text with emotional context
  let analysis = '';
  
  if (sortedThemes.length > 0) {
    analysis = `📊 **Theme Analysis**: Your journal shows strong ${sortedThemes.slice(0, 3).join(', ')} tendencies. `;
  } else {
    analysis = '📊 **Theme Analysis**: Your journal entries show a balanced mix of interests. ';
  }
  
  if (emotionalTone === 'positive') {
    analysis += '😊 **Emotional Pattern**: You feel most engaged and satisfied when working on activities that excite you. ';
  } else if (emotionalTone === 'negative') {
    analysis += '😟 **Emotional Pattern**: You may be experiencing some dissatisfaction with your current activities. ';
  } else {
    analysis += '😐 **Emotional Pattern**: You maintain a balanced emotional state across different activities. ';
  }
  
  if (challengeCount > achievementCount) {
    analysis += '🧩 **Problem-Solving**: You seem to enjoy overcoming challenges and solving complex problems. ';
  } else if (achievementCount > challengeCount) {
    analysis += '🏆 **Achievement**: You get satisfaction from completing tasks and achieving goals. ';
  }
  
  analysis += '\n\nBased on these patterns, here are careers that align with your natural tendencies and interests.';
  
  return {
    careerSuggestions: topCareers.map((suggestion, index) => 
      `${index + 1}. ${suggestion}`
    ).join('\n'),
    analysis,
    confidence: sortedThemes.length >= 3 ? 'high' : sortedThemes.length >= 1 ? 'medium' : 'low',
    themes: sortedThemes.slice(0, 5),
    topMatches,
    success: true
  };
};

// Extract common career interests from text
const extractCareerInterests = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const interests: string[] = [];
  
  const careerKeywords: Record<string, string[]> = {
    technology: ['computer', 'software', 'tech', 'code', 'program', 'app', 'website', 'digital', 'ai', 'data'],
    science: ['science', 'research', 'experiment', 'lab', 'biology', 'physics', 'chemistry', 'discovery'],
    arts: ['art', 'design', 'creative', 'draw', 'paint', 'music', 'write', 'photography', 'video'],
    business: ['business', 'market', 'sales', 'finance', 'money', 'entrepreneur', 'startup', 'profit'],
    education: ['teach', 'learn', 'education', 'school', 'student', 'study', 'knowledge', 'mentor'],
    healthcare: ['health', 'medical', 'doctor', 'nurse', 'care', 'patient', 'hospital', 'wellness'],
    law: ['law', 'legal', 'court', 'justice', 'rights', 'argue', 'policy'],
    sports: ['sports', 'game', 'gaming', 'esports', 'athlete', 'competition', 'tournament'],
    architecture: ['build', 'design', 'structure', 'space', 'building', 'architecture', 'construct']
  };
  
  Object.entries(careerKeywords).forEach(([interest, keywords]) => {
    const matches = keywords.filter(keyword => lowerText.includes(keyword));
    if (matches.length >= 2) {
      interests.push(interest);
    }
  });
  
  return interests;
};

export async function processJournalEntriesForCareerSuggestions(
  input: JournalEntryInput
): Promise<CareerSuggestionsOutput> {
  try {
    // Validate input
    const validatedInput = JournalEntryInputSchema.parse(input);
    
    let result: CareerSuggestionsOutput;
    
    // Try local analysis first (fast and reliable)
    const localResult = analyzeJournalEntriesLocally(
      validatedInput.journalEntries,
      validatedInput.feelings
    );
    
    // Only use AI if requested and local analysis has low confidence
    if (validatedInput.useAIFallback && localResult.confidence === 'low') {
      try {
        console.log('Attempting AI analysis for journal entries...');
        const aiResult = await processJournalEntriesFromModel(
          validatedInput.journalEntries,
          validatedInput.feelings
        );
        
        // Validate AI result
        if (aiResult && 
            aiResult.careerSuggestions && 
            aiResult.careerSuggestions.length > 20) {
          
          // Extract interests to validate AI suggestions
          const text = `${validatedInput.journalEntries} ${validatedInput.feelings}`;
          const interests = extractCareerInterests(text);
          
          // Use AI result if valid
          result = {
            ...aiResult,
            confidence: 'high',
            themes: aiResult.themes || interests || localResult.themes,
            topMatches: aiResult.topMatches || localResult.topMatches,
            success: true
          };
          
          console.log('✅ AI analysis successful');
        } else {
          // AI result invalid, use local
          console.log('⚠️ AI result invalid, using local analysis');
          result = localResult;
        }
      } catch (aiError) {
        console.warn('⚠️ AI analysis failed, using local analysis:', aiError);
        result = localResult;
      }
    } else {
      // Use local analysis directly
      result = localResult;
    }
    
    // Format the output
    const finalResult = {
      careerSuggestions: result.careerSuggestions || localResult.careerSuggestions,
      analysis: result.analysis || localResult.analysis,
      confidence: result.confidence || localResult.confidence || 'medium',
      themes: result.themes || localResult.themes || [],
      topMatches: result.topMatches || localResult.topMatches || [],
      success: true
    };
    
    return CareerSuggestionsOutputSchema.parse(finalResult);
    
  } catch (error) {
    console.error('❌ Error processing journal entries:', error);
    
    // Always return a valid response
    const fallbackResult: CareerSuggestionsOutput = {
      careerSuggestions: `1. Career Counselor\n2. Life Coach\n3. Personal Development Specialist\n4. Human Resources Professional\n5. Wellness Coordinator`,
      analysis: '📝 Based on your interest in self-reflection and personal growth through journaling, these careers focus on helping others with their personal and professional development. Your consistent journaling practice shows dedication to self-improvement and emotional intelligence.',
      confidence: 'medium',
      themes: ['reflective', 'personal growth', 'emotional intelligence'],
      topMatches: ['Career Counselor', 'Life Coach', 'Personal Development Specialist'],
      success: false
    };
    
    return CareerSuggestionsOutputSchema.parse(fallbackResult);
  }
}

// ==================== ADDITIONAL HELPER FUNCTIONS ====================

/**
 * Extract recurring patterns from multiple journal entries
 */
export async function analyzeJournalPatterns(
  entries: Array<{ date: string; content: string; mood: string }>
): Promise<{
  patterns: string[];
  moodTrend: 'improving' | 'declining' | 'stable';
  frequentTopics: string[];
  careerInsights: string[];
}> {
  try {
    const allContent = entries.map(e => e.content).join(' ');
    const moods = entries.map(e => e.mood);
    
    // Simple pattern detection
    const patterns: string[] = [];
    const topics: Record<string, number> = {};
    const careerInsights: string[] = [];
    
    // Common topic detection
    const commonTopics = ['work', 'study', 'family', 'friends', 'hobby', 'exercise', 'health', 'goals', 'project', 'team', 'creative'];
    
    commonTopics.forEach(topic => {
      const regex = new RegExp(`\\b${topic}\\b`, 'gi');
      const count = (allContent.match(regex) || []).length;
      if (count >= 2) {
        topics[topic] = count;
      }
    });
    
    // Mood trend analysis
    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (entries.length >= 3) {
      const firstHalfAvg = moods.slice(0, Math.floor(moods.length / 2))
        .filter(m => m === 'positive').length;
      const secondHalfAvg = moods.slice(Math.floor(moods.length / 2))
        .filter(m => m === 'positive').length;
      
      if (secondHalfAvg > firstHalfAvg + 2) moodTrend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 2) moodTrend = 'declining';
    }
    
    // Identify patterns and insights
    if (Object.keys(topics).length >= 3) patterns.push('Diverse range of interests');
    if (topics['work'] && topics['work'] >= 3) {
      patterns.push('Work-focused mindset');
      careerInsights.push('Strong work orientation - consider careers with clear structure');
    }
    if (topics['goals'] && topics['goals'] >= 2) {
      patterns.push('Goal-oriented thinking');
      careerInsights.push('Goal-oriented - would excel in careers with clear milestones');
    }
    if (topics['creative'] && topics['creative'] >= 2) {
      patterns.push('Creative expression');
      careerInsights.push('Creative thinker - consider careers in design, content, or innovation');
    }
    if (topics['team'] && topics['team'] >= 2) {
      patterns.push('Collaborative mindset');
      careerInsights.push('Collaborative - thrives in team-based environments');
    }
    
    return {
      patterns: patterns.length > 0 ? patterns : ['Balanced lifestyle'],
      moodTrend,
      frequentTopics: Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic),
      careerInsights: careerInsights.length > 0 ? careerInsights : ['Continue exploring different interests']
    };
  } catch (error) {
    console.error('Error analyzing journal patterns:', error);
    return {
      patterns: ['Regular reflection habit'],
      moodTrend: 'stable',
      frequentTopics: ['personal development'],
      careerInsights: ['Your journaling practice shows self-awareness - valuable in any career']
    };
  }
}