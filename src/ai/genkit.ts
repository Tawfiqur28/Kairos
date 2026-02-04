
'use server';

import { config } from 'dotenv';
import careerData from '@/lib/careers.json';
config();

// Lazily import dashscope to improve initial load time.
let dashscopeGeneration: any;
async function getDashscopeGeneration() {
  if (!dashscopeGeneration) {
    const dashscope = await import('dashscope');
    dashscopeGeneration = dashscope.Generation;
  }
  return dashscopeGeneration;
}

// ==================== API CALLER ====================
async function callModelScopeAI(prompt: string, model: string): Promise<string> {
  const API_KEY = process.env.MODELSCOPE_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ MODELSCOPE_API_KEY is missing or not set in .env file');
    return 'ERROR: ModelScope API key not configured. Please add it to your .env file.';
  }

  try {
    const Generation = await getDashscopeGeneration();
    const result = await Generation.call({
      model: model,
      prompt: prompt,
      apiKey: API_KEY,
    });

    if (result.statusCode === 200 && result.output && result.output.text) {
      const text = result.output.text;
      // Clean up markdown code blocks if present
      if (text.startsWith('```json')) {
        return text.substring(7, text.length - 3).trim();
      }
      if (text.startsWith('```')) {
        return text.substring(3, text.length - 3).trim();
      }
      return text;
    } else {
      console.error('ModelScope API Error:', result);
      return `ERROR: API call failed with status ${result.statusCode}. Message: ${result.message}`;
    }
  } catch (error) {
    console.error('Error calling ModelScope API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return `ERROR: An unexpected error occurred while calling the AI model. Details: ${errorMessage}`;
  }
}

// ==================== API CALLER for CHAT ====================
async function callModelScopeChat(messages: {role: string, content: string}[], model: string): Promise<string> {
  const API_KEY = process.env.MODELSCOPE_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ MODELSCOPE_API_KEY is missing or not set in .env file');
    return 'ERROR: ModelScope API key not configured. Please add it to your .env file.';
  }

  try {
    const Generation = await getDashscopeGeneration();
    const result = await Generation.call({
      model: model,
      messages: messages,
      apiKey: API_KEY,
    });

    if (result.statusCode === 200 && result.output?.choices?.[0]?.message?.content) {
      return result.output.choices[0].message.content;
    } else {
      const errorMessage = result.message || (result.output ? JSON.stringify(result.output) : 'Unknown error');
      console.error('ModelScope Chat API Error:', errorMessage);
      return `ERROR: API call failed with status ${result.statusCode}. Message: ${errorMessage}`;
    }
  } catch (error) {
    console.error('Error calling ModelScope Chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return `ERROR: An unexpected error occurred while calling the AI model. Details: ${errorMessage}`;
  }
}

// ==================== ENHANCED CAREER DATABASE ====================
type CareerEntry = {
  name: string;
  requiredThemes: string[];
  incompatibleThemes: string[];
};

type CareerDatabase = {
  [key: string]: CareerEntry[];
};

const CAREER_DATABASE: CareerDatabase = {
  Tech: [
    { name: 'Software Engineer', requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Cloud Architect', requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Data Scientist', requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
    { name: 'Cybersecurity Analyst', requiredThemes: ['Tech'], incompatibleThemes: ['Arts'] },
    { name: 'AI Researcher', requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
    { name: 'Quantum Computing Engineer', requiredThemes: ['Tech', 'Physics'], incompatibleThemes: ['Music', 'Arts'] }
  ],
  Physics: [
    { name: 'Physicist', requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    { name: 'Astrophysicist', requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    { name: 'Medical Physicist', requiredThemes: ['Physics', 'Healthcare'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Engineering Physicist', requiredThemes: ['Physics', 'Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Research Scientist (Physics)', requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    { name: 'Physics Teacher/Professor', requiredThemes: ['Physics', 'Education'], incompatibleThemes: [] }
  ],
  Chemistry: [
    { name: 'Chemist', requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Chemical Engineer', requiredThemes: ['Chemistry', 'Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Pharmaceutical Researcher', requiredThemes: ['Chemistry', 'Healthcare'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Materials Scientist', requiredThemes: ['Chemistry', 'Physics'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Analytical Chemist', requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Environmental Chemist', requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Chemistry Teacher/Professor', requiredThemes: ['Chemistry', 'Education'], incompatibleThemes: [] }
  ],
  Science: [
    { name: 'Biologist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Geneticist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Microbiologist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Biomedical Researcher', requiredThemes: ['Science', 'Healthcare'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Environmental Scientist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] }
  ],
  Music: [
    { name: 'Music Producer', requiredThemes: ['Music'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    { name: 'Sound Engineer', requiredThemes: ['Music', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
    { name: 'Music Teacher', requiredThemes: ['Music', 'Education'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    { name: 'Composer', requiredThemes: ['Music', 'Arts'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    { name: 'Audio Programmer', requiredThemes: ['Music', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] }
  ],
  Business: [
    { name: 'Marketing Manager', requiredThemes: ['Business'], incompatibleThemes: [] },
    { name: 'Financial Analyst', requiredThemes: ['Business'], incompatibleThemes: [] }
  ],
  Arts: [
    { name: 'Graphic Designer', requiredThemes: ['Arts'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
    { name: 'UI/UX Designer', requiredThemes: ['Arts', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] }
  ]
};

// ==================== FAST THEME EXTRACTION (NO AI) ====================
export const extractCareerThemes = async (userProfile: string): Promise<string[]> => {
  return Promise.resolve(detectScienceThemesFromKeywords(userProfile));
};

const detectScienceThemesFromKeywords = (profile: string): string[] => {
  const lowerProfile = profile.toLowerCase();
  const themes: string[] = [];
  
  const keywordMap: Record<string, string[]> = {
    Tech: ['code', 'programming', 'computer', 'software', 'developer', 'engineer', 'python', 'java', 'javascript', 'tech', 'ai', 'machine learning', 'data', 'algorithm'],
    Physics: ['physics', 'quantum', 'relativity', 'astronomy', 'space', 'energy', 'force', 'motion', 'thermodynamics', 'particle', 'nuclear', 'mechanics', 'electromagnetism'],
    Chemistry: ['chemistry', 'chemical', 'molecule', 'atom', 'reaction', 'lab', 'organic', 'inorganic', 'biochemistry', 'compound', 'element', 'periodic table', 'synthesis'],
    Science: ['biology', 'research', 'experiment', 'scientific', 'lab work', 'analysis', 'genetics', 'microbiology', 'environmental', 'biomedical'],
    Music: ['music', 'song', 'instrument', 'guitar', 'piano', 'producer', 'sound', 'audio', 'band', 'concert', 'sing', 'compose', 'melody', 'rhythm'],
    Business: ['business', 'market', 'finance', 'management', 'entrepreneur', 'startup', 'sales', 'investment'],
    Arts: ['art', 'design', 'creative', 'drawing', 'painting', 'visual', 'graphic', 'ui/ux']
  };
  
  Object.entries(keywordMap).forEach(([theme, keywords]) => {
    const count = keywords.filter(keyword => lowerProfile.includes(keyword)).length;
    if (count >= 2) { // Require at least 2 keyword matches
      themes.push(theme);
    }
  });
  
  // Filter out incompatible themes for science users
  if (themes.includes('Physics') || themes.includes('Chemistry')) {
    const filtered = themes.filter(theme => !['Music', 'Arts'].includes(theme));
    return filtered.length > 0 ? filtered : themes;
  }
  
  return themes;
};

// ==================== IMPROVED CAREER MATCHING WITH DYNAMIC SCORING ====================
type CareerMatchResult = {
  explanation: string;
  skillMatch: number;
  interestMatch: number;
  valueAlignment: number;
  overallScore: number;
  themeMismatch: boolean;
  confidence: 'high' | 'medium' | 'low';
};

export const generateCareerMatchExplanations = async (
  userProfile: string, 
  career: string, 
  careerDetails: string
): Promise<CareerMatchResult> => {
  // FIRST: Calculate a base score based on keyword matching (before AI call)
  const userThemes = await extractCareerThemes(userProfile);
  const baseScore = calculateInitialScore(userThemes, career);
  
  // Don't always show 50% - use calculated base score
  const getFallback = (score: number, isScience = false) => {
    const baseExplanation = `Based on your background in ${userThemes.join(', ') || 'various fields'}, ${career} has approximately ${score}% alignment.`;
    const scienceExplanation = `${baseExplanation} This is an initial assessment based on your scientific interests.`;
    const genericExplanation = `${baseExplanation} Consider exploring this field further to see if it matches your goals.`;
    
    return {
      explanation: isScience ? scienceExplanation : genericExplanation,
      skillMatch: score,
      interestMatch: score,
      valueAlignment: score,
      overallScore: score,
      themeMismatch: false,
      confidence: 'medium'
    };
  };

  // Check for career cluster and theme compatibility
  const careerInfo = careerData.careers.find(c => c.title === career);
  const careerCluster = careerInfo?.cluster;
  const scienceClusters = ['Tech', 'Science', 'Physics', 'Chemistry'];
  const isScienceCareer = careerCluster ? scienceClusters.includes(careerCluster) : false;

  // Check for theme mismatches early
  const themeMismatch = checkScienceThemeMismatch(userThemes, career);
  
  if (themeMismatch === 'strong') {
    return {
      explanation: `❌ **Major Theme Mismatch**: Your profile shows strong ${userThemes.join('/')} interests, but "${career}" requires different skills. Consider exploring ${userThemes.join(' or ')}-focused careers for better alignment.`,
      skillMatch: 15,
      interestMatch: 10,
      valueAlignment: 25,
      overallScore: 18,
      themeMismatch: true,
      confidence: 'high'
    };
  }
  
  if (themeMismatch === 'moderate') {
    const adjustedScore = Math.max(30, baseScore - 20);
    return {
      explanation: `⚠️ **Partial Theme Alignment**: Your ${userThemes.join('/')} background has some overlap with ${career}, but there may be better matches. Consider developing additional skills for this field.`,
      skillMatch: adjustedScore,
      interestMatch: adjustedScore - 10,
      valueAlignment: adjustedScore,
      overallScore: adjustedScore - 5,
      themeMismatch: true,
      confidence: 'medium'
    };
  }

  // Try AI analysis for better personalized scoring
  try {
    let prompt = '';
    
    if (isScienceCareer) {
      let specializedPrompt = '';
      if (career.includes('Physicist') || career.includes('Physics')) {
        specializedPrompt = `**PHYSICS SPECIALIZATION**: Focus on mathematical aptitude, problem-solving skills, and interest in fundamental principles.`;
      } else if (career.includes('Chemist') || career.includes('Chemical')) {
        specializedPrompt = `**CHEMISTRY SPECIALIZATION**: Focus on lab skills, attention to detail, safety awareness, and interest in molecular interactions.`;
      } else if (career.includes('Engineer')) {
        specializedPrompt = `**ENGINEERING SPECIALIZATION**: Focus on practical application, design skills, and problem-solving.`;
      }
      
      prompt = `Analyze career fit for SCIENCE/TECH oriented user:

USER PROFILE (Themes: [${userThemes.join(', ')}]): ${userProfile}

CAREER: ${career}
CAREER DETAILS: ${careerDetails}

${specializedPrompt}

**IMPORTANT:** Consider the user's education level and provide stage-specific advice.

Calculate scores based on:
1. skillMatch (0-100): Technical/math/lab skills alignment
2. interestMatch (0-100): Scientific interests alignment  
3. valueAlignment (0-100): Desire for discovery/innovation/impact

**BASE SCORE TO CONSIDER:** ${baseScore}% (based on theme matching)

Calculate: overallScore = (skillMatch * 0.5) + (interestMatch * 0.3) + (valueAlignment * 0.2)

Respond with JSON: {
  "explanation": "Detailed analysis...",
  "skillMatch": 85,
  "interestMatch": 90,
  "valueAlignment": 70,
  "overallScore": 83,
  "themeMismatch": false,
  "confidence": "high"
}`;
    } else {
      prompt = `Analyze the career fit for a user.

USER PROFILE (Themes: [${userThemes.join(', ')}]): ${userProfile}

CAREER: ${career}
CAREER DETAILS: ${careerDetails}

**IMPORTANT:** Provide education-level specific advice.

**BASE SCORE TO CONSIDER:** ${baseScore}% (based on initial theme matching)

Calculate: overallScore = (skillMatch * 0.4) + (interestMatch * 0.4) + (valueAlignment * 0.2)

Respond with JSON: {
  "explanation": "Detailed analysis...",
  "skillMatch": 80,
  "interestMatch": 85,
  "valueAlignment": 75,
  "overallScore": 81,
  "themeMismatch": false,
  "confidence": "high"
}`;
    }

    const response = await callModelScopeAI(prompt, 'qwen-max');
    
    if (response.startsWith('ERROR:')) {
      console.warn('AI analysis failed, using calculated base score:', baseScore);
      return getFallback(baseScore, isScienceCareer);
    }
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure scores are calculated
        if (!parsed.overallScore) {
          const weights = isScienceCareer ? [0.5, 0.3, 0.2] : [0.4, 0.4, 0.2];
          parsed.overallScore = Math.round(
            (parsed.skillMatch || baseScore) * weights[0] + 
            (parsed.interestMatch || baseScore) * weights[1] + 
            (parsed.valueAlignment || baseScore) * weights[2]
          );
        }
        
        // Ensure scores are within reasonable range
        parsed.overallScore = Math.max(10, Math.min(100, parsed.overallScore));
        parsed.skillMatch = Math.max(10, Math.min(100, parsed.skillMatch || baseScore));
        parsed.interestMatch = Math.max(10, Math.min(100, parsed.interestMatch || baseScore));
        parsed.valueAlignment = Math.max(10, Math.min(100, parsed.valueAlignment || baseScore));
        
        return { 
          ...parsed, 
          confidence: parsed.confidence || (parsed.overallScore > 70 ? 'high' : parsed.overallScore > 50 ? 'medium' : 'low')
        };
      }
    } catch (e) {
      console.warn('JSON parse failed:', e);
    }
  } catch (error) {
    console.error('Error in career matching:', error);
  }
  
  // Fallback with calculated score, not fixed 50%
  return getFallback(baseScore, isScienceCareer);
};

// Helper: Calculate initial score based on theme matching
const calculateInitialScore = (userThemes: string[], career: string): number => {
  let score = 50; // Start at 50, not fixed 50
  
  // Find career in database
  for (const [theme, careers] of Object.entries(CAREER_DATABASE)) {
    const foundCareer = careers.find(c => c.name === career);
    if (foundCareer) {
      // Bonus for matching required themes
      foundCareer.requiredThemes.forEach(reqTheme => {
        if (userThemes.includes(reqTheme)) {
          score += 20; // +20% for each matching required theme
        }
      });
      
      // Penalty for incompatible themes
      foundCareer.incompatibleThemes.forEach(incompTheme => {
        if (userThemes.includes(incompTheme)) {
          score -= 25; // -25% for each incompatible theme
        }
      });
      
      break;
    }
  }
  
  // Additional keyword-based scoring
  const careerLower = career.toLowerCase();
  
  if (careerLower.includes('physics') && userThemes.includes('Physics')) score += 15;
  if (careerLower.includes('chem') && userThemes.includes('Chemistry')) score += 15;
  if (careerLower.includes('engineer') && userThemes.includes('Tech')) score += 10;
  if (careerLower.includes('data') && userThemes.includes('Tech')) score += 10;
  if (careerLower.includes('research') && userThemes.includes('Science')) score += 10;
  
  // Keep score within bounds
  return Math.max(10, Math.min(95, score));
};

// Helper: Check science theme mismatches
const checkScienceThemeMismatch = (userThemes: string[], career: string): 'strong' | 'moderate' | 'none' => {
  for (const [theme, careers] of Object.entries(CAREER_DATABASE)) {
    const found = careers.find(c => c.name === career);
    if (found) {
      const hasPhysicsChemistry = userThemes.some(t => ['Physics', 'Chemistry'].includes(t));
      const isMusicArts = found.requiredThemes.some(t => ['Music', 'Arts'].includes(t));
      
      if (hasPhysicsChemistry && isMusicArts) {
        return 'strong';
      }
      
      const hasIncompatible = found.incompatibleThemes.some(incomp => 
        userThemes.includes(incomp)
      );
      
      return hasIncompatible ? 'moderate' : 'none';
    }
  }
  return 'none';
};

// ==================== STRUCTURED ACTION PLAN ====================
export const generatePersonalizedActionPlan = async (
  careerGoal: string,
  userDetails: string,
): Promise<{
  careerTitle: string;
  educationLevel: string;
  timeline: string;
  phases: { title: string; duration: string; tasks: { id: string; text: string; completed: boolean }[] }[];
}> => {
  // Extract education level from user details
  const educationLevel = extractEducationLevel(userDetails);
  
  const prompt = `Create a detailed, actionable 3-year plan for a user aiming to become a '${careerGoal}'.
  
User Profile: "${userDetails}"
Education Level: "${educationLevel}"

**IMPORTANT:** Tailor the plan specifically to their education level:
- High School: Focus on foundational courses, extracurriculars, and college prep
- Undergraduate: Focus on major courses, internships, and skill-building
- Graduate/Master's: Focus on specialization, research, and networking
- Professional: Focus on career transition, certification, and portfolio building

Create 3 phases with concrete, actionable tasks.

Respond with ONLY valid JSON:
{
  "careerTitle": "${careerGoal}",
  "educationLevel": "${educationLevel}",
  "timeline": "3-Year Plan to ${careerGoal}",
  "phases": [
    {
      "title": "Phase 1: Foundation",
      "duration": "Months 1-12",
      "tasks": [
        { "id": "task-1-1", "text": "Concrete task 1", "completed": false },
        { "id": "task-1-2", "text": "Concrete task 2", "completed": false },
        { "id": "task-1-3", "text": "Concrete task 3", "completed": false }
      ]
    },
    {
      "title": "Phase 2: Skill Development",
      "duration": "Year 2",
      "tasks": [
        { "id": "task-2-1", "text": "Concrete task 1", "completed": false },
        { "id": "task-2-2", "text": "Concrete task 2", "completed": false },
        { "id": "task-2-3", "text": "Concrete task 3", "completed": false }
      ]
    },
    {
      "title": "Phase 3: Specialization & Entry",
      "duration": "Year 3",
      "tasks": [
        { "id": "task-3-1", "text": "Concrete task 1", "completed": false },
        { "id": "task-3-2", "text": "Concrete task 2", "completed": false },
        { "id": "task-3-3", "text": "Concrete task 3", "completed": false }
      ]
    }
  ]
}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  // Fallback plan
  const fallback = {
    careerTitle: careerGoal,
    educationLevel: educationLevel,
    timeline: `3-Year Plan to ${careerGoal}`,
    phases: [
      {
        title: 'Phase 1: Foundation Building',
        duration: 'Months 1-12',
        tasks: [
          { id: 'fb-1-1', text: `Research ${careerGoal} career requirements and salary expectations`, completed: false },
          { id: 'fb-1-2', text: `Complete an introductory online course in the field`, completed: false },
          { id: 'fb-1-3', text: `Connect with 2-3 professionals in the industry on LinkedIn`, completed: false }
        ]
      },
      {
        title: 'Phase 2: Skill Development',
        duration: 'Year 2',
        tasks: [
          { id: 'fb-2-1', text: `Build a portfolio project demonstrating relevant skills`, completed: false },
          { id: 'fb-2-2', text: `Complete an intermediate certification or course`, completed: false },
          { id: 'fb-2-3', text: `Attend at least one industry conference or webinar`, completed: false }
        ]
      },
      {
        title: 'Phase 3: Career Entry',
        duration: 'Year 3',
        tasks: [
          { id: 'fb-3-1', text: `Apply for internships or entry-level positions`, completed: false },
          { id: 'fb-3-2', text: `Prepare and practice for technical interviews`, completed: false },
          { id: 'fb-3-3', text: `Finalize your professional portfolio and LinkedIn profile`, completed: false }
        ]
      }
    ]
  };

  if (response.startsWith('ERROR:')) {
    console.error("API Error:", response);
    return fallback;
  }

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.phases && parsed.phases.length >= 3) {
        return parsed;
      }
    }
    return fallback;
  } catch (e) {
    console.error('JSON parse failed:', e);
    return fallback;
  }
};

// Helper: Extract education level from user profile
const extractEducationLevel = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  if (details.includes('high school') || details.includes('highschool')) return 'High School';
  if (details.includes('undergraduate') || details.includes('bachelor') || details.includes('college')) return 'Undergraduate';
  if (details.includes('master') || details.includes('graduate')) return 'Master\'s';
  if (details.includes('phd') || details.includes('doctorate')) return 'PhD';
  if (details.includes('professional') || details.includes('working')) return 'Professional';
  return 'Not Specified';
};

// ==================== NEW: KAIROS CHATBOT ====================
export const kairosChat = async (input: {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  userProfile?: string;
}): Promise<string> => {
  const systemPrompt = `You are KAIROS, a helpful AI assistant for students integrated into a career planning application. Your goal is to provide guidance on studies, college applications, research, and other academic or career-related problems. Be supportive, encouraging, and provide actionable advice.
The user you are talking to has the following profile:
${input.userProfile || 'Not provided.'}

When answering, be concise and clear. Use markdown for formatting if it helps readability.`;

  const messages: {role: 'system' | 'user' | 'assistant', content: string}[] = [
    { role: 'system', content: systemPrompt },
    ...(input.history || []),
    { role: 'user', content: input.message },
  ];

  // @ts-ignore
  return callModelScopeChat(messages, 'qwen-max');
};


// ==================== NEW: GET ALL CAREERS WITH SCORES ====================
export const getAllCareerScores = async (
  userProfile: string,
  limit: number = 10
): Promise<Array<{career: string, score: number, explanation: string}>> => {
  // Get all unique careers from your database
  const allCareers: string[] = [];
  Object.values(CAREER_DATABASE).forEach(careerList => {
    careerList.forEach(career => {
      if (!allCareers.includes(career.name)) {
        allCareers.push(career.name);
      }
    });
  });
  
  // Calculate scores for each career
  const scoredCareers = await Promise.all(
    allCareers.slice(0, limit).map(async (career) => {
      const result = await generateCareerMatchExplanations(
        userProfile, 
        career, 
        `Career in ${career} field`
      );
      
      return {
        career,
        score: result.overallScore,
        explanation: result.explanation
      };
    })
  );
  
  // Sort by score (highest first)
  return scoredCareers.sort((a, b) => b.score - a.score);
};
