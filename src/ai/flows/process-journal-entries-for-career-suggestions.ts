'use server';

/**
 * @fileOverview Analyzes user journal entries to provide career suggestions based on their daily feelings.
 */

import { z } from 'zod';
import { processJournalEntriesForCareerSuggestions as processJournalEntriesFromModel } from '@/ai/genkit';

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
  success: z.boolean().optional()
    .describe('Whether the analysis was successful'),
});
export type CareerSuggestionsOutput = z.infer<typeof CareerSuggestionsOutputSchema>;

// Local keyword analysis function (fast, no AI dependency)
const analyzeJournalEntriesLocally = (
  journalEntries: string,
  feelings: string
): CareerSuggestionsOutput => {
  const text = `${journalEntries} ${feelings}`.toLowerCase();
  
  // Theme detection from keywords
  const themes: string[] = [];
  const themeScores: Record<string, number> = {};
  
  // Define theme keywords
  const themeKeywords: Record<string, string[]> = {
    creative: ['create', 'design', 'art', 'draw', 'paint', 'write', 'compose', 'imagine', 'innovate', 'invent'],
    technical: ['code', 'program', 'build', 'solve', 'technical', 'engineer', 'develop', 'algorithm', 'data', 'system'],
    analytical: ['analyze', 'research', 'study', 'examine', 'investigate', 'statistics', 'data', 'patterns', 'logic'],
    social: ['help', 'people', 'team', 'communicate', 'teach', 'guide', 'support', 'listen', 'collaborate'],
    organized: ['plan', 'organize', 'manage', 'schedule', 'system', 'efficient', 'structure', 'order'],
    outdoors: ['nature', 'outside', 'physical', 'active', 'exercise', 'travel', 'explore', 'adventure'],
    detail: ['detail', 'precise', 'accurate', 'meticulous', 'careful', 'thorough', 'perfection'],
    leadership: ['lead', 'manage', 'direct', 'strategize', 'decision', 'vision', 'motivate', 'inspire'],
    independent: ['alone', 'solo', 'independent', 'autonomous', 'self-directed', 'individual'],
  };
  
  // Calculate theme scores
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });
    if (score > 0) {
      themeScores[theme] = score;
      if (score >= 2) {
        themes.push(theme);
      }
    }
  });
  
  // Detect emotional tone
  const positiveWords = ['happy', 'excited', 'fulfilled', 'satisfied', 'proud', 'joy', 'love', 'passion'];
  const negativeWords = ['stress', 'anxious', 'worried', 'frustrated', 'bored', 'tired', 'overwhelmed'];
  const challengeWords = ['challenge', 'difficult', 'hard', 'struggle', 'problem', 'obstacle'];
  
  let emotionalTone = 'neutral';
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => { if (text.includes(word)) positiveCount++; });
  negativeWords.forEach(word => { if (text.includes(word)) negativeCount++; });
  
  if (positiveCount > negativeCount + 2) emotionalTone = 'positive';
  else if (negativeCount > positiveCount + 2) emotionalTone = 'negative';
  
  // Generate career suggestions based on themes
  const careerSuggestionsMap: Record<string, string[]> = {
    creative: ['Graphic Designer', 'Content Creator', 'Writer/Author', 'UI/UX Designer', 'Artist', 'Architect'],
    technical: ['Software Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'Systems Administrator', 'DevOps Engineer'],
    analytical: ['Data Analyst', 'Research Scientist', 'Business Analyst', 'Financial Analyst', 'Market Researcher'],
    social: ['Teacher', 'Counselor', 'Social Worker', 'Human Resources', 'Customer Success Manager', 'Therapist'],
    organized: ['Project Manager', 'Operations Manager', 'Event Planner', 'Administrative Coordinator', 'Logistics Manager'],
    outdoors: ['Environmental Scientist', 'Park Ranger', 'Tour Guide', 'Outdoor Educator', 'Landscape Architect'],
    detail: ['Quality Assurance Tester', 'Editor', 'Accountant', 'Pharmacist', 'Technical Writer'],
    leadership: ['Team Lead', 'Department Manager', 'Entrepreneur', 'Executive Director', 'Product Manager'],
    independent: ['Freelancer', 'Consultant', 'Researcher', 'Writer', 'Artist', 'Independent Contractor'],
  };
  
  // Generate suggestions
  let careerSuggestions: string[] = [];
  
  if (themes.length > 0) {
    themes.forEach(theme => {
      if (careerSuggestionsMap[theme]) {
        careerSuggestions = [...careerSuggestions, ...careerSuggestionsMap[theme]];
      }
    });
  } else {
    // Fallback suggestions if no strong themes
    careerSuggestions = [
      'Project Manager',
      'Business Analyst', 
      'Marketing Specialist',
      'Customer Service Representative',
      'Administrative Assistant'
    ];
  }
  
  // Remove duplicates and limit to 5
  const uniqueSuggestions = [...new Set(careerSuggestions)].slice(0, 5);
  
  // Generate analysis text
  let analysis = '';
  
  if (themes.length > 0) {
    analysis = `Your journal shows strong ${themes.join(', ')} tendencies. `;
  } else {
    analysis = 'Your journal entries show a balanced mix of interests. ';
  }
  
  if (emotionalTone === 'positive') {
    analysis += 'You seem to feel most engaged when working on activities that excite you. ';
  } else if (emotionalTone === 'negative') {
    analysis += 'You may be experiencing some dissatisfaction with your current activities. ';
  } else {
    analysis += 'You maintain a balanced emotional state across different activities. ';
  }
  
  if (text.includes(challengeWords.find(w => text.includes(w)) || '')) {
    analysis += 'You appear to enjoy overcoming challenges and solving complex problems. ';
  }
  
  analysis += 'Consider careers that align with these patterns for greater satisfaction.';
  
  return {
    careerSuggestions: uniqueSuggestions.map((suggestion, index) => 
      `${index + 1}. ${suggestion}`
    ).join('\n'),
    analysis,
    confidence: themes.length >= 2 ? 'high' : themes.length === 1 ? 'medium' : 'low',
    themes,
    success: true
  };
};

// Extract common career interests from text
const extractCareerInterests = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const interests: string[] = [];
  
  const careerKeywords: Record<string, string[]> = {
    technology: ['computer', 'software', 'tech', 'code', 'program', 'app', 'website', 'digital'],
    science: ['science', 'research', 'experiment', 'lab', 'biology', 'physics', 'chemistry'],
    arts: ['art', 'design', 'creative', 'draw', 'paint', 'music', 'write', 'photography'],
    business: ['business', 'market', 'sales', 'finance', 'money', 'entrepreneur', 'startup'],
    education: ['teach', 'learn', 'education', 'school', 'student', 'study', 'knowledge'],
    healthcare: ['health', 'medical', 'doctor', 'nurse', 'care', 'patient', 'hospital'],
    service: ['help', 'serve', 'community', 'people', 'support', 'assist', 'volunteer'],
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
            aiResult.careerSuggestions.length > 10 &&
            aiResult.analysis && 
            aiResult.analysis.length > 20) {
          
          // Extract interests to validate AI suggestions
          const text = `${validatedInput.journalEntries} ${validatedInput.feelings}`;
          const interests = extractCareerInterests(text);
          
          // If interests found, use AI result
          if (interests.length > 0 || aiResult.careerSuggestions.includes('1.')) {
            result = {
              ...aiResult,
              confidence: 'high',
              themes: interests,
              success: true
            };
          } else {
            // AI result seems generic, use local
            result = localResult;
          }
        } else {
          // AI result invalid, use local
          result = localResult;
        }
      } catch (aiError) {
        console.warn('AI analysis failed, using local analysis:', aiError);
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
      success: true
    };
    
    return CareerSuggestionsOutputSchema.parse(finalResult);
    
  } catch (error) {
    console.error('Error processing journal entries:', error);
    
    // Always return a valid response
    const fallbackResult: CareerSuggestionsOutput = {
      careerSuggestions: `1. Career Counselor\n2. Life Coach\n3. Personal Development Specialist\n4. Human Resources Professional\n5. Wellness Coordinator`,
      analysis: 'Based on your interest in self-reflection and personal growth through journaling, these careers focus on helping others with their personal and professional development. Your consistent journaling practice shows dedication to self-improvement.',
      confidence: 'medium',
      themes: ['reflective', 'personal growth'],
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
}> {
  try {
    const allContent = entries.map(e => e.content).join(' ');
    const moods = entries.map(e => e.mood);
    
    // Simple pattern detection
    const patterns: string[] = [];
    const topics: Record<string, number> = {};
    
    // Common topic detection
    const commonTopics = ['work', 'study', 'family', 'friends', 'hobby', 'exercise', 'health', 'goals'];
    
    commonTopics.forEach(topic => {
      const count = (allContent.toLowerCase().match(new RegExp(topic, 'g')) || []).length;
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
    
    // Identify patterns
    if (Object.keys(topics).length >= 3) patterns.push('Diverse range of interests');
    if (topics['work'] && topics['work'] >= 3) patterns.push('Work-focused mindset');
    if (topics['goals'] && topics['goals'] >= 2) patterns.push('Goal-oriented thinking');
    
    return {
      patterns: patterns.length > 0 ? patterns : ['Balanced lifestyle'],
      moodTrend,
      frequentTopics: Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic)
    };
  } catch (error) {
    console.error('Error analyzing journal patterns:', error);
    return {
      patterns: ['Regular reflection habit'],
      moodTrend: 'stable',
      frequentTopics: ['personal development']
    };
  }
}