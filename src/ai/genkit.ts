// import { config } from 'dotenv';
// config();

// import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/google-genai';

// export const ai = genkit({
//   plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
// });

// src/ai/genkit.ts - REPLACE ENTIRE FILE

import { config } from 'dotenv';
config();

// ====== DELETE ALL GOOGLE AI CODE ======
// Remove this entire line:
// import { googleAI } from '@genkit-ai/google-ai';

// ====== ADD MODELSCORE INTEGRATION ======

/**
 * Direct ModelScope API caller
 * This replaces Google Gemini with ModelScope Qwen models
 */
export const callModelScopeAI = async (
  prompt: string, 
  model: string = 'qwen-max' // Using Qwen from Bailian platform
): Promise<string> => {
  const API_KEY = process.env.MODELSCOPE_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ MODELSCOPE_API_KEY is missing in .env file');
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
      throw new Error(`ModelScope API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract response based on ModelScope format
    const result = data.output?.text || 
                   data.output?.choices?.[0]?.message?.content || 
                   'No response generated';
    
    console.log('✅ ModelScope API call successful');
    return result;
    
  } catch (error) {
    console.error('❌ Failed to call ModelScope API:', error);
    throw error;
  }
};

// ====== FOR BACKWARD COMPATIBILITY ======
// If other files expect an 'ai' object, create a simple wrapper

export const ai = {
  generate: async (params: { prompt: string, model?: string }) => {
    const result = await callModelScopeAI(params.prompt, params.model || 'qwen-max');
    return { text: result };
  }
};

// ====== SPECIALIZED FUNCTIONS FOR YOUR APP ======

/**
 * Career matching function using ModelScope
 */
export const generateCareerMatchExplanations = async (
  userProfile: string, 
  career: string, 
  careerDetails: string
) => {
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
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Could not parse JSON from AI response, using fallback');
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
  career: string,
  userLevel: string = 'high school junior'
) => {
  const prompt = `Create a detailed 3-year step-by-step plan for a ${userLevel} to pursue a career in ${career}.
  
Make it VERY specific with:
- Year 1: Specific courses, activities, skills to learn
- Year 2: Projects, internships, certifications
- Year 3: College applications, portfolio building, job preparation

Be practical and actionable.`;

  return await callModelScopeAI(prompt, 'qwen-max');
};