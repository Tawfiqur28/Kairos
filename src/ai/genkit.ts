import { config } from 'dotenv';
config();

/**
 * Direct ModelScope API caller
 * This replaces Google Gemini with ModelScope Qwen models
 */
export const callModelScopeAI = async (
  prompt: string, 
  model: string = 'qwen-max' // Using Qwen from Bailian platform
): Promise<string> => {
  const API_KEY = process.env.MODELSCOPE_API_KEY;
  
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ MODELSCOPE_API_KEY is missing or not set in .env file');
    throw new Error('ModelScope API key not configured. Check your .env file.');
  }

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            result_format: 'message',
            temperature: 0.7,
            top_p: 0.8
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ModelScope API error:', response.status, errorText);
      throw new Error(`ModelScope API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response based on ModelScope format
    const result = data.output?.text || 
                   data.output?.choices?.[0]?.message?.content || 
                   '';
    
    if (!result) {
        console.warn('ModelScope response was empty or in an unexpected format', data);
        return 'No response generated from AI.';
    }

    console.log('✅ ModelScope API call successful');
    return result;
    
  } catch (error) {
    console.error('❌ Failed to call ModelScope API:', error);
    throw error;
  }
};

/**
 * Extracts career themes from a user's Ikigai profile.
 */
export const extractCareerThemes = async (userProfile: string): Promise<string[]> => {
  const prompt = `Based on the following user profile, identify the main career themes.
User Profile: "${userProfile}"

Please respond with a JSON array of strings, choosing from these possible themes: "Tech", "Arts", "Science", "Business", "Healthcare", "Education".
For example: ["Tech", "Business"]`;
  const response = await callModelScopeAI(prompt, 'qwen-max');
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Could not parse JSON array from AI response for themes', response);
  }
  return [];
};


/**
 * Career matching function using ModelScope
 */
export const generateCareerMatchExplanations = async (
  userProfile: string, 
  career: string, 
  careerDetails: string
): Promise<{ explanation: string, skillMatch: number, interestMatch: number, valueAlignment: number }> => {
  const prompt = `As a career advisor, analyze this match:
  
USER PROFILE: ${userProfile}
CAREER: ${career}
CAREER DETAILS: ${careerDetails}

Provide scores (0-100) for the following, based on the user profile:
1. skillMatch: How well the user's skills align with the career's required skills.
2. interestMatch: How well the user's passions and interests align with the career's day-to-day activities.
3. valueAlignment: How well the career aligns with the user's values and what they believe the world needs.

Also provide a personalized explanation for the match.

Format as JSON: {"explanation": "...", "skillMatch": 80, "interestMatch": 90, "valueAlignment": 70}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Could not parse JSON from AI response, using fallback', response);
  }
  
  // Fallback response
  return {
    explanation: response.substring(0, 500) + '...',
    skillMatch: 70,
    interestMatch: 70,
    valueAlignment: 70,
  };
};

/**
 * Plan generation function using ModelScope
 */
export const generatePersonalizedActionPlan = async (
  careerGoal: string,
  userDetails: string
): Promise<string> => {
  const prompt = `Create a detailed, personalized action plan for a user to pursue a career in ${careerGoal}.

User Details: ${userDetails}

Structure the plan into four phases with specific, actionable steps for each:
- Immediate Steps (Next 30 Days):
- 3-Month Roadmap:
- 6-Month Goals:
- 1-Year Vision:

Be practical and encouraging. Respond only with the plan text, using markdown for formatting.`;

  return await callModelScopeAI(prompt, 'qwen-max');
};

/**
 * Journal processing function using ModelScope
 */
export const processJournalEntriesForCareerSuggestions = async (
  journalEntries: string,
  feelings: string
): Promise<{ careerSuggestions: string, analysis: string }> => {
  const prompt = `You are a career counselor. Analyze the following journal entries and feelings of the user to provide career suggestions.

Journal Entries: ${journalEntries}

Feelings: ${feelings}

Based on the user's journal entries and feelings, suggest some career paths that the user might find fulfilling and provide an analysis of why these careers might be a good fit for the user.

Format as JSON: {"careerSuggestions": "...", "analysis": "..."}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Could not parse JSON from AI response, using fallback', response);
  }

  // Fallback response
  return {
    careerSuggestions: "Could not generate suggestions. The AI response was not in the expected format.",
    analysis: response.substring(0, 500) + '...',
  };
};
