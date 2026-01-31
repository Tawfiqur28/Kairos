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
 * Career matching function using ModelScope
 */
export const generateCareerMatchExplanations = async (
  userProfile: string, 
  career: string, 
  careerDetails: string
): Promise<{ explanation: string, fitScore: number }> => {
  const prompt = `As a career advisor, analyze this match:
  
USER PROFILE: ${userProfile}

CAREER: ${career}
CAREER DETAILS: ${careerDetails}

Provide:
1. A personalized explanation of why this career is a good match
2. A numerical fit score (0-100)

Format as JSON: {"explanation": "...", "fitScore": 85}`;

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
    fitScore: 75
  };
};

/**
 * Plan generation function using ModelScope
 */
export const generatePersonalizedActionPlan = async (
  careerGoal: string,
  userDetails: string
): Promise<string> => {
  const prompt = `Create a detailed 3-year step-by-step plan for a user to pursue a career in ${careerGoal}.
  
User Details: ${userDetails}
  
Make it VERY specific with:
- Year 1: Specific courses, activities, skills to learn
- Year 2: Projects, internships, certifications
- Year 3: College applications, portfolio building, job preparation

Be practical and actionable. Respond only with the plan.`;

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
