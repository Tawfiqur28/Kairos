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

// ==================== ENHANCED CAREER DATABASE WITH EDUCATION LEVEL ====================
type CareerEntry = {
  name: string;
  requiredThemes: string[];
  incompatibleThemes: string[];
  educationLevels: ('high_school' | 'undergrad' | 'masters' | 'phd')[]; // NEW: Added education levels
  typicalPath: {
    high_school?: string[];
    undergrad?: string[];
    masters?: string[];
    phd?: string[];
  };
};

type CareerDatabase = {
  [key: string]: CareerEntry[];
};

const CAREER_DATABASE: CareerDatabase = {
  Tech: [
    { 
      name: 'Software Engineer', 
      requiredThemes: ['Tech'], 
      incompatibleThemes: ['Music', 'Arts'],
      educationLevels: ['high_school', 'undergrad', 'masters', 'phd'],
      typicalPath: {
        high_school: ['AP Computer Science', 'Join coding club', 'Build simple apps'],
        undergrad: ['CS degree', 'Internships', 'Build portfolio'],
        masters: ['Specialize in AI/ML', 'Research project', 'Industry projects'],
        phd: ['Dissertation in CS', 'Publications', 'Academic/Industry research']
      }
    },
    { 
      name: 'Cloud Architect', 
      requiredThemes: ['Tech'], 
      incompatibleThemes: ['Music', 'Arts'],
      educationLevels: ['undergrad', 'masters'],
      typicalPath: {
        undergrad: ['CS/IT degree', 'Cloud certifications', 'Network fundamentals'],
        masters: ['Cloud computing specialization', 'Enterprise projects', 'Security focus']
      }
    },
    { 
      name: 'Data Scientist', 
      requiredThemes: ['Tech', 'Science'], 
      incompatibleThemes: ['Music'],
      educationLevels: ['undergrad', 'masters', 'phd'],
      typicalPath: {
        undergrad: ['Statistics/CS degree', 'Python/R skills', 'Data analysis projects'],
        masters: ['ML specialization', 'Kaggle competitions', 'Business analytics'],
        phd: ['Statistical research', 'Algorithm development', 'Published papers']
      }
    },
  ],
  // ... (other career categories with similar structure)
};

// ==================== API CALLER ====================
async function callModelScopeAI(prompt: string, model: string): Promise<string> {
  const API_KEY = process.env.MODELSCOPE_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('MODELSCOPE_API_KEY is missing or not set in .env file');
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
    console.error('MODELSCOPE_API_KEY is missing or not set in .env file');
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

// ==================== EDUCATION LEVEL AWARE THEME EXTRACTION ====================
export const extractCareerThemes = async (userProfile: string, educationLevel?: string): Promise<string[]> => {
  // NEW: Enhanced with education level context
  const educationContext = educationLevel ? `Education Level: ${educationLevel}. ` : '';
  
  const prompt = `Analyze this user's profile for career themes.
${educationContext}User Profile: "${userProfile}"

Available themes: ["Tech", "Physics", "Chemistry", "Science", "Music", "Business", "Arts", "Healthcare", "Education"]

**EDUCATION LEVEL GUIDANCE:**
- High School: Focus on interests and basic skills
- Undergraduate: Consider major and coursework
- Master's: Focus on specialization areas
- PhD: Consider research focus and expertise

Respond ONLY with JSON array. Example: ["Physics", "Tech"] or ["Chemistry"]`;

  const response = await callModelScopeAI(prompt, 'qwen-max');
  
  if (response.startsWith('ERROR:')) {
    return detectScienceThemesFromKeywords(userProfile);
  }
  
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Theme extraction JSON parse failed:', e);
  }
  
  return detectScienceThemesFromKeywords(userProfile);
};

// Enhanced keyword detection for sciences
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
    if (count >= 2) {
      themes.push(theme);
    }
  });
  
  return themes.length > 0 ? themes : ['Tech'];
};

// ==================== ENHANCED CAREER MATCHING WITH EDUCATION LEVEL ====================
type CareerMatchResult = {
  explanation: string;
  skillMatch: number;
  interestMatch: number;
  valueAlignment: number;
  overallScore: number;
  themeMismatch: boolean;
  confidence: 'high' | 'medium' | 'low';
  educationAlignment: string; // NEW: Added education alignment rating
  timeline: string; // NEW: Estimated timeline
  nextSteps: string[]; // NEW: Specific next steps
};

const calculateInitialScore = (userThemes: string[], career: string): number => {
  let score = 50;
  
  const themeMap: Record<string, string[]> = {
    Tech: ['software', 'engineer', 'developer', 'cloud', 'cyber'],
    Science: ['scientist', 'researcher'],
    Physics: ['physicist'],
    Chemistry: ['chemist'],
    Music: ['music', 'producer', 'audio'],
    Business: ['market', 'business', 'manager'],
    Arts: ['design', 'artist', 'visual'],
    Healthcare: ['health', 'nurse', 'medical'],
    Education: ['teach', 'education']
  };

  const careerLower = career.toLowerCase();
  
  for (const theme of userThemes) {
    if (themeMap[theme] && themeMap[theme].some(keyword => careerLower.includes(keyword))) {
      score += 20; // Bonus for direct theme match
    }
  }

  // Penalty for mismatch
  const hasScience = userThemes.includes('Science') || userThemes.includes('Physics') || userThemes.includes('Chemistry');
  const hasArts = userThemes.includes('Arts') || userThemes.includes('Music');

  if ((themeMap['Science']?.some(k => careerLower.includes(k)) || themeMap['Physics']?.some(k => careerLower.includes(k)) || themeMap['Chemistry']?.some(k => careerLower.includes(k))) && hasArts) {
    score -= 15;
  }
  if ((themeMap['Arts']?.some(k => careerLower.includes(k)) || themeMap['Music']?.some(k => careerLower.includes(k))) && hasScience) {
    score -= 15;
  }
  
  return Math.max(10, Math.min(95, score));
};

const checkScienceThemeMismatch = (userThemes: string[], career: string): 'strong' | false => {
    const scienceThemes = ['Physics', 'Chemistry', 'Science'];
    const artThemes = ['Arts', 'Music'];

    const careerIsScience = scienceThemes.some(theme => career.toLowerCase().includes(theme.toLowerCase()));
    const careerIsArt = artThemes.some(theme => career.toLowerCase().includes(theme.toLowerCase()));

    const userHasScience = userThemes.some(theme => scienceThemes.includes(theme));
    const userHasArt = userThemes.some(theme => artThemes.includes(theme));

    if (careerIsScience && userHasArt) {
        return 'strong';
    }
    if (careerIsArt && userHasScience) {
        return 'strong';
    }

    return false;
};

export const generateCareerMatchExplanations = async (
  userProfile: string, 
  career: string, 
  careerDetails: string,
  educationLevel?: string // NEW: Added education level parameter
): Promise<CareerMatchResult> => {
  
  const userThemes = await extractCareerThemes(userProfile, educationLevel);
  const baseScore = calculateInitialScore(userThemes, career);
  
  // NEW: Education level compatibility check
  const educationCompatibility = checkEducationCompatibility(career, educationLevel);
  const educationBonus = educationCompatibility.score;
  const educationExplanation = educationCompatibility.explanation;
  
  const themeMismatch = checkScienceThemeMismatch(userThemes, career);
  
  if (themeMismatch === 'strong') {
    return {
      explanation: `**Major Theme Mismatch**: ${educationExplanation} Your profile shows strong ${userThemes.join('/')} interests, but "${career}" requires different skills.`,
      skillMatch: 15,
      interestMatch: 10,
      valueAlignment: 25,
      overallScore: 18,
      themeMismatch: true,
      confidence: 'high',
      educationAlignment: 'low',
      timeline: 'Not recommended',
      nextSteps: [`Explore ${userThemes.join(' or ')}-focused careers`, 'Consider skill development']
    };
  }
  
  try {
    const isScienceCareer = career.toLowerCase().includes('physics') || 
                           career.toLowerCase().includes('chemistry') || 
                           career.toLowerCase().includes('engineer') ||
                           career.toLowerCase().includes('scientist');
    
    let prompt = '';
    
    if (isScienceCareer) {
      prompt = `Analyze career fit with EDUCATION LEVEL CONSIDERATION.

USER PROFILE (Themes: [${userThemes.join(', ')}], Education: ${educationLevel || 'Not specified'}): ${userProfile}

CAREER: ${career}
CAREER DETAILS: ${careerDetails}

**EDUCATION-LEVEL SPECIFIC ANALYSIS:**
${getEducationLevelPrompt(educationLevel)}

**SCORING CONSIDERATIONS:**
1. skillMatch (0-100): Current skill alignment for ${educationLevel} level
2. interestMatch (0-100): Interest alignment considering education stage
3. valueAlignment (0-100): How well career fits education/career goals

**BASE CALCULATION:** Start from ${baseScore + educationBonus}% (theme match + education compatibility)

Calculate: overallScore = (skillMatch * 0.5) + (interestMatch * 0.3) + (valueAlignment * 0.2)

**REQUIRED OUTPUT (JSON):**
{
  "explanation": "Detailed analysis including education-level suitability...",
  "skillMatch": 85,
  "interestMatch": 90,
  "valueAlignment": 70,
  "overallScore": 83,
  "themeMismatch": false,
  "confidence": "high",
  "educationAlignment": "excellent/good/fair/poor",
  "timeline": "3-5 years to entry level",
  "nextSteps": ["Step 1 for ${educationLevel}", "Step 2", "Step 3"]
}`;
    } else {
      prompt = `Analyze career fit with EDUCATION LEVEL FOCUS.

USER (Education: ${educationLevel || 'Not specified'}): ${userProfile}
CAREER: ${career}

**EDUCATION-LEVEL GUIDANCE:**
${getEducationLevelPrompt(educationLevel)}

**BASE SCORE:** ${baseScore + educationBonus}%

**OUTPUT JSON:**
{
  "explanation": "Analysis...",
  "skillMatch": 80,
  "interestMatch": 85,
  "valueAlignment": 75,
  "overallScore": 81,
  "themeMismatch": false,
  "confidence": "high",
  "educationAlignment": "good",
  "timeline": "Estimated completion time",
  "nextSteps": ["Immediate action", "Next quarter", "Long-term"]
}`;
    }

    const response = await callModelScopeAI(prompt, 'qwen-max');
    
    if (!response.startsWith('ERROR:')) {
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Ensure required fields
          if (!parsed.educationAlignment) {
            parsed.educationAlignment = educationBonus > 20 ? 'good' : educationBonus > 10 ? 'fair' : 'poor';
          }
          
          return parsed;
        }
      } catch (e) {
        console.warn('JSON parse failed:', e);
      }
    }
    
  } catch (error) {
    console.error('Error in career matching:', error);
  }
  
  // Fallback with education consideration
  const adjustedScore = baseScore + educationBonus;
  const educationAlignment = educationBonus > 20 ? 'good' : educationBonus > 10 ? 'fair' : 'poor';
  
  return {
    explanation: `${educationExplanation} Based on your ${userThemes.join(', ')} background and ${educationLevel || 'current'} education, ${career} shows ${adjustedScore}% alignment.`,
    skillMatch: adjustedScore,
    interestMatch: adjustedScore - 5,
    valueAlignment: adjustedScore,
    overallScore: adjustedScore,
    themeMismatch: false,
    confidence: 'medium',
    educationAlignment,
    timeline: getTimelineEstimate(career, educationLevel),
    nextSteps: getNextSteps(career, educationLevel)
  };
};

// NEW: Education compatibility check
const checkEducationCompatibility = (career: string, educationLevel?: string) => {
  if (!educationLevel) return { score: 0, explanation: '' };
  
  // Find career in database
  for (const [theme, careers] of Object.entries(CAREER_DATABASE)) {
    const foundCareer = careers.find(c => c.name === career);
    if (foundCareer) {
      const isCompatible = foundCareer.educationLevels.includes(educationLevel as any);
      const typicalPath = foundCareer.typicalPath[educationLevel as keyof typeof foundCareer.typicalPath];
      
      if (isCompatible && typicalPath) {
        return {
          score: 25,
          explanation: `Education Compatible: ${career} is suitable for ${educationLevel} students. Typical path includes: ${typicalPath.join(', ')}.`
        };
      } else if (!isCompatible) {
        return {
          score: -20,
          explanation: `Education Consideration: ${career} typically requires different education level. Consider these alternatives or plan for further education.`
        };
      }
      break;
    }
  }
  
  return { score: 0, explanation: `No specific education guidance available for ${career} at ${educationLevel} level.` };
};

// NEW: Get education level specific prompt
const getEducationLevelPrompt = (educationLevel?: string): string => {
  const prompts = {
    high_school: `For HIGH SCHOOL student: Focus on foundational skills, college prep, and exploration. Suggest AP courses, extracurriculars, and summer programs. Timeline: 4-6 years to entry level.`,
    undergrad: `For UNDERGRADUATE student: Focus on major courses, internships, skill-building, and networking. Timeline: 2-4 years to entry level.`,
    masters: `For MASTER'S student: Focus on specialization, research projects, professional networking, and industry connections. Timeline: 1-3 years to specialized role.`,
    phd: `For PhD student: Focus on research contribution, publication strategy, academic networking, and career positioning. Timeline: Variable based on dissertation completion.`
  };
  
  return prompts[educationLevel as keyof typeof prompts] || 'Provide general career guidance.';
};

// NEW: Get timeline estimate
const getTimelineEstimate = (career: string, educationLevel?: string): string => {
  const timelines = {
    high_school: '4-6 years (including college)',
    undergrad: '2-4 years',
    masters: '1-3 years',
    phd: 'Variable (3-5+ years)'
  };
  
  const baseTimeline = timelines[educationLevel as keyof typeof timelines] || '2-5 years';
  return `Estimated: ${baseTimeline} to entry-level ${career}`;
};

// NEW: Get next steps
const getNextSteps = (career: string, educationLevel?: string): string[] => {
  const steps: Record<string, string[]> = {
    high_school: [
      'Research college programs for this field',
      'Take relevant AP or honors courses',
      'Join related clubs or competitions',
      'Find summer programs or internships'
    ],
    undergrad: [
      'Declare relevant major/minor',
      'Secure internship in related field',
      'Build project portfolio',
      'Network with professionals in industry'
    ],
    masters: [
      'Choose specialization within field',
      'Start research project or thesis',
      'Attend professional conferences',
      'Build industry connections'
    ],
    phd: [
      'Define dissertation topic',
      'Start publishing research',
      'Network with senior academics',
      'Explore post-doc or industry options'
    ]
  };
  
  return steps[educationLevel as keyof typeof steps] || [
    'Research career requirements',
    'Identify skill gaps',
    'Create learning plan',
    'Network with professionals'
  ];
};

// Keep existing helper functions (calculateInitialScore, checkScienceThemeMismatch) as they are...

// ==================== ENHANCED ACTION PLAN WITH EDUCATION LEVEL ====================
export const generatePersonalizedActionPlan = async (
  careerGoal: string,
  userDetails: string,
  educationLevel?: string // NEW: Added parameter
): Promise<{
  careerTitle: string;
  educationLevel: string;
  timeline: string;
  missionName: string; // NEW: Added mission name
  phases: { 
    title: string; 
    duration: string; 
    tasks: { id: string; text: string; completed: boolean }[];
    powerUps?: string[]; // NEW: Added power-ups
    bossFights?: string[]; // NEW: Added challenges
  }[];
  resources: { title: string; url: string; type: string }[]; // NEW: Added resources
}> => {
  
  const extractedLevel = educationLevel || extractEducationLevel(userDetails);
  
  const prompt = `Create a SPICY, engaging 3-year action plan for becoming a '${careerGoal}'.
  
User Profile: "${userDetails}"
Education Level: "${extractedLevel}"

**REQUIREMENTS:**
1. Create a COOL MISSION NAME (max 5 words) for this journey
2. Tailor ALL content to ${extractedLevel} level
3. Include 3 phases with catchy names
4. Each phase must have:
   - 3 actionable tasks
   - 2 "Power-Ups" (skills to learn)
   - 1 "Boss Fight" (challenge to overcome)
5. Add 3-5 relevant resources (free/paid)
6. Use emojis and motivational language

**EDUCATION-LEVEL SPECIFIC:**
${getEducationLevelPrompt(extractedLevel)}

**FORMAT (STRICT JSON):**
{
  "careerTitle": "${careerGoal}",
  "educationLevel": "${extractedLevel}",
  "timeline": "3-Year Journey to ${careerGoal}",
  "missionName": "Epic mission name here",
  "phases": [
    {
      "title": "Phase 1: Catchy Name",
      "duration": "Months 1-12",
      "tasks": [
        { "id": "task-1-1", "text": "Actionable task", "completed": false }
      ],
      "powerUps": ["Skill 1", "Skill 2"],
      "bossFights": ["Challenge description"]
    }
  ],
  "resources": [
    { "title": "Resource Name", "url": "https://...", "type": "video/article/tool" }
  ]
}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  // Enhanced fallback with education level
  const fallback = {
    careerTitle: careerGoal,
    educationLevel: extractedLevel,
    timeline: `3-Year ${extractedLevel} Plan to ${careerGoal}`,
    missionName: `Mission: Conquer ${careerGoal}`,
    phases: [
      {
        title: `Phase 1: ${extractedLevel} Foundation`,
        duration: 'Months 1-12',
        tasks: [
          { id: 'fb-1-1', text: `Research ${careerGoal} career path for ${extractedLevel} students`, completed: false },
          { id: 'fb-1-2', text: `Complete introductory course in the field`, completed: false },
          { id: 'fb-1-3', text: `Connect with 2 professionals in the industry`, completed: false }
        ],
        powerUps: ['Basic terminology', 'Industry awareness'],
        bossFights: ['Complete first project in the field']
      },
      {
        title: 'Phase 2: Skill Mastery',
        duration: 'Year 2',
        tasks: [
          { id: 'fb-2-1', text: `Build portfolio project demonstrating skills`, completed: false },
          { id: 'fb-2-2', text: `Complete intermediate certification`, completed: false },
          { id: 'fb-2-3', text: `Attend industry event or conference`, completed: false }
        ],
        powerUps: ['Advanced techniques', 'Professional tools'],
        bossFights: ['Secure internship or practical experience']
      },
      {
        title: 'Phase 3: Career Launch',
        duration: 'Year 3',
        tasks: [
          { id: 'fb-3-1', text: `Apply for relevant positions/internships`, completed: false },
          { id: 'fb-3-2', text: `Prepare for interviews and assessments`, completed: false },
          { id: 'fb-3-3', text: `Finalize professional online presence`, completed: false }
        ],
        powerUps: ['Interview skills', 'Portfolio polishing'],
        bossFights: ['Land first role in the field']
      }
    ],
    resources: [
      { title: 'LinkedIn Learning', url: 'https://linkedin.com/learning', type: 'platform' },
      { title: 'Coursera', url: 'https://coursera.org', type: 'platform' },
      { title: 'Industry Forums', url: 'https://reddit.com/r/[industry]', type: 'community' }
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
      return { ...fallback, ...parsed }; // Merge with fallback for safety
    }
  } catch (e) {
    console.error('JSON parse failed:', e);
  }
  
  return fallback;
};

// ==================== ENHANCED KAIROS CHATBOT ====================
export const kairosChat = async (input: {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  userProfile?: string;
  educationLevel?: 'high_school' | 'undergrad' | 'masters' | 'phd'; // NEW: Added
  mode?: 'general' | 'assignment' | 'professor' | 'study'; // NEW: Added modes
}): Promise<{
  message: string;
  suggestions?: string[];
  resources?: { title: string; url: string; type: string }[];
  professorMatches?: any[]; // NEW: For professor finding
  nextSteps?: string[];
}> => {
  
  const systemPrompt = `You are KAIROS ACADEMIC ASSISTANT, a specialized chatbot for ${input.educationLevel || 'student'} support.

**MODES:**
${input.mode === 'assignment' ? 'ASSIGNMENT HELP MODE: Provide structured guidance, outlines, and resources.' : ''}
${input.mode === 'professor' ? 'PROFESSOR MATCHING MODE: Help find and connect with relevant professors.' : ''}
${input.mode === 'study' ? 'STUDY HELP MODE: Provide study strategies, exam tips, and learning techniques.' : ''}
${!input.mode ? 'GENERAL HELP MODE: Provide academic and career guidance.' : ''}

**EDUCATION LEVEL: ${input.educationLevel?.toUpperCase() || 'NOT SPECIFIED'}**
${getEducationLevelChatContext(input.educationLevel)}

User Profile: ${input.userProfile || 'Not provided.'}

**RESPONSE FORMAT:** Provide actionable, encouraging advice with specific examples.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(input.history || []),
    { role: 'user', content: input.message },
  ];

  const response = await callModelScopeChat(messages, 'qwen-max');
  
  if (response.startsWith('ERROR:')) {
    return {
      message: getFallbackChatResponse(input.educationLevel, input.mode),
      suggestions: ['Try rephrasing your question', 'Check your internet connection']
    };
  }
  
  // Try to parse as JSON for structured responses
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch && input.mode === 'professor') {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.log('Not a JSON response, using as plain text');
  }
  
  return {
    message: response,
    suggestions: getDefaultSuggestions(input.educationLevel, input.mode)
  };
};

// NEW: Education level chat context
const getEducationLevelChatContext = (educationLevel?: string): string => {
  const contexts = {
    high_school: `HIGH SCHOOL focus: Foundational concepts, exam prep, college applications, study skills, time management.`,
    undergrad: `UNDERGRAD focus: Coursework, assignments, projects, internships, networking, grad school prep.`,
    masters: `MASTER'S focus: Research methodology, thesis writing, specialization, professional networking.`,
    phd: `PhD focus: Dissertation, publications, academic networking, grant writing, career positioning.`
  };
  return contexts[educationLevel as keyof typeof contexts] || 'Provide general student guidance.';
};

// NEW: Fallback chat responses
const getFallbackChatResponse = (educationLevel?: string, mode?: string): string => {
  const baseResponses = {
    high_school: "I can help with homework, study strategies, and college prep! What subject are you working on?",
    undergrad: "I can assist with assignments, project ideas, and finding academic resources. What do you need help with?",
    masters: "I can help with research methodology, literature review, and connecting with professors. What's your research topic?",
    phd: "I can assist with dissertation structure, publication strategy, and academic networking. What aspect of your research needs attention?"
  };
  
  const modeSpecific = {
    assignment: "I can help break down assignments and provide structure guidance.",
    professor: "I can help you find professors matching your research interests.",
    study: "I can provide study techniques and exam preparation strategies."
  };
  
  const base = baseResponses[educationLevel as keyof typeof baseResponses] || 
               "I'm here to help with your academic questions. What do you need assistance with?";
  const modeMsg = mode ? ` ${modeSpecific[mode as keyof typeof modeSpecific]}` : '';
  
  return base + modeMsg;
};

// NEW: Default suggestions
const getDefaultSuggestions = (educationLevel?: string, mode?: string): string[] => {
  const suggestions: Record<string, string[]> = {
    high_school: ['Check Khan Academy', 'Create study schedule', 'Ask teacher for clarification'],
    undergrad: ['Visit professor office hours', 'Form study group', 'Use academic support center'],
    masters: ['Review literature databases', 'Network with researchers', 'Attend department seminars'],
    phd: ['Attend conferences', 'Collaborate with other labs', 'Seek mentorship']
  };
  
  return suggestions[educationLevel as keyof typeof suggestions] || [
    'Break down the problem',
    'Seek additional resources',
    'Ask for help when needed'
  ];
};

// ==================== GET ALL CAREER SCORES WITH EDUCATION FILTER ====================
export const getAllCareerScores = async (
  userProfile: string,
  educationLevel?: string,
  limit: number = 10
): Promise<Array<{
  career: string;
  score: number;
  explanation: string;
  educationAlignment: string;
  timeline: string;
}>> => {
  
  const allCareers: string[] = [];
  Object.values(CAREER_DATABASE).forEach(careerList => {
    careerList.forEach(career => {
      if (!allCareers.includes(career.name)) {
        allCareers.push(career.name);
      }
    });
  });
  
  // Filter by education level if provided
  let filteredCareers = allCareers;
  if (educationLevel) {
    filteredCareers = allCareers.filter(career => {
      for (const [theme, careers] of Object.entries(CAREER_DATABASE)) {
        const found = careers.find(c => c.name === career);
        if (found && found.educationLevels.includes(educationLevel as any)) {
          return true;
        }
      }
      return false;
    });
  }
  
  const scoredCareers = await Promise.all(
    filteredCareers.slice(0, limit).map(async (career) => {
      try {
        const result = await generateCareerMatchExplanations(
          userProfile, 
          career, 
          `Career in ${career} field`,
          educationLevel
        );
        
        return {
          career,
          score: result.overallScore,
          explanation: result.explanation,
          educationAlignment: result.educationAlignment,
          timeline: result.timeline
        };
      } catch (error) {
        console.error(`Error scoring career ${career}:`, error);
        return {
          career,
          score: 50,
          explanation: 'Unable to generate detailed analysis.',
          educationAlignment: 'unknown',
          timeline: 'Variable'
        };
      }
    })
  );
  
  return scoredCareers.sort((a, b) => b.score - a.score);
};

// ==================== HELPER FUNCTIONS ====================
const extractEducationLevel = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  if (details.includes('high school') || details.includes('highschool')) return 'high_school';
  if (details.includes('undergraduate') || details.includes('bachelor') || details.includes('college')) return 'undergrad';
  if (details.includes('master') || details.includes('graduate')) return 'masters';
  if (details.includes('phd') || details.includes('doctorate')) return 'phd';
  return 'not_specified';
};

// Keep existing helper functions (calculateInitialScore, checkScienceThemeMismatch) unchanged...

export {
  callModelScopeAI,
};
