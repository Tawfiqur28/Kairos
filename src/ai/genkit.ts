'use server';

import { config } from 'dotenv';
import { Generation } from 'dashscope';
config();

// ==================== API CALLER ====================
async function callModelScopeAI(prompt: string, model: string): Promise<string> {
  const API_KEY = process.env.MODELSCOPE_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ MODELSCOPE_API_KEY is missing or not set in .env file');
    return 'ERROR: ModelScope API key not configured. Please add it to your .env file.';
  }

  try {
    const result = await Generation.call({
      model: model,
      prompt: prompt,
      apiKey: API_KEY,
    });

    if (result.status_code === 200 && result.output && result.output.text) {
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
      return `ERROR: API call failed with status ${result.status_code}. Message: ${result.message}`;
    }
  } catch (error) {
    console.error('Error calling ModelScope API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return `ERROR: An unexpected error occurred while calling the AI model. Details: ${errorMessage}`;
  }
}


// ==================== ENHANCED CAREER DATABASE ====================
const CAREER_DATABASE = {
  // TECH careers
  Tech: [
    { name: 'Software Engineer', requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Cloud Architect', requiredThemes: ['Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Data Scientist', requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
    { name: 'Cybersecurity Analyst', requiredThemes: ['Tech'], incompatibleThemes: ['Arts'] },
    { name: 'AI Researcher', requiredThemes: ['Tech', 'Science'], incompatibleThemes: ['Music'] },
    { name: 'Quantum Computing Engineer', requiredThemes: ['Tech', 'Physics'], incompatibleThemes: ['Music', 'Arts'] }
  ],
  
  // PHYSICS careers
  Physics: [
    { name: 'Physicist', requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    { name: 'Astrophysicist', requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    { name: 'Medical Physicist', requiredThemes: ['Physics', 'Healthcare'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Engineering Physicist', requiredThemes: ['Physics', 'Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Research Scientist (Physics)', requiredThemes: ['Physics', 'Science'], incompatibleThemes: ['Music', 'Business'] },
    { name: 'Physics Teacher/Professor', requiredThemes: ['Physics', 'Education'], incompatibleThemes: [] }
  ],
  
  // CHEMISTRY careers
  Chemistry: [
    { name: 'Chemist', requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Chemical Engineer', requiredThemes: ['Chemistry', 'Tech'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Pharmaceutical Researcher', requiredThemes: ['Chemistry', 'Healthcare'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Materials Scientist', requiredThemes: ['Chemistry', 'Physics'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Analytical Chemist', requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Environmental Chemist', requiredThemes: ['Chemistry', 'Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Chemistry Teacher/Professor', requiredThemes: ['Chemistry', 'Education'], incompatibleThemes: [] }
  ],
  
  // BIOLOGY careers
  Science: [
    { name: 'Biologist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Geneticist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Microbiologist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Biomedical Researcher', requiredThemes: ['Science', 'Healthcare'], incompatibleThemes: ['Music', 'Arts'] },
    { name: 'Environmental Scientist', requiredThemes: ['Science'], incompatibleThemes: ['Music', 'Arts'] }
  ],
  
  // MUSIC careers
  Music: [
    { name: 'Music Producer', requiredThemes: ['Music'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    { name: 'Sound Engineer', requiredThemes: ['Music', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
    { name: 'Music Teacher', requiredThemes: ['Music', 'Education'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    { name: 'Composer', requiredThemes: ['Music', 'Arts'], incompatibleThemes: ['Tech', 'Science', 'Physics', 'Chemistry'] },
    { name: 'Audio Programmer', requiredThemes: ['Music', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] }
  ],
  
  // Other categories...
  Business: [
    { name: 'Marketing Manager', requiredThemes: ['Business'], incompatibleThemes: [] },
    { name: 'Financial Analyst', requiredThemes: ['Business'], incompatibleThemes: [] }
  ],
  Arts: [
    { name: 'Graphic Designer', requiredThemes: ['Arts'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] },
    { name: 'UI/UX Designer', requiredThemes: ['Arts', 'Tech'], incompatibleThemes: ['Science', 'Physics', 'Chemistry'] }
  ]
};

// ==================== ENHANCED THEME EXTRACTION ====================
export const extractCareerThemes = async (userProfile: string): Promise<string[]> => {
  const prompt = `Analyze this user's Ikigai profile and identify their dominant career themes.
  
USER PROFILE: "${userProfile}"

Available themes: ["Tech", "Physics", "Chemistry", "Science", "Music", "Business", "Arts", "Healthcare", "Education"]

**STRICT RULES:**
1. Only select themes that are EXPLICITLY mentioned or strongly implied
2. Tech themes: "code", "programming", "computer", "software", "ai", "machine learning", "developer", "engineer"
3. Physics themes: "physics", "quantum", "relativity", "astronomy", "space", "energy", "force", "motion", "thermodynamics"
4. Chemistry themes: "chemistry", "chemical", "molecule", "atom", "reaction", "lab", "organic", "inorganic", "biochemistry"
5. Science themes: "biology", "research", "experiment", "scientific", "lab work", "analysis"
6. Music themes: "music", "song", "instrument", "sound", "audio", "band", "concert", "sing", "compose"
7. If contradictory themes (e.g., "code" AND "music"), choose the STRONGER one based on frequency
8. Return empty array [] if uncertain

Respond ONLY with JSON array. Example: ["Physics", "Tech"] or ["Chemistry"]`;

  const response = await callModelScopeAI(prompt, 'qwen-max');
  
  if (response.startsWith('ERROR:')) {
    return detectScienceThemesFromKeywords(userProfile);
  }
  
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const themes = JSON.parse(jsonMatch[0]);
      console.log('Extracted science themes:', themes);
      return themes;
    }
  } catch (e) {
    console.warn('Theme extraction JSON parse failed:', e);
  }
  
  return detectScienceThemesFromKeywords(userProfile);
};

// Enhanced keyword detection for sciences
const detectScienceThemesFromKeywords = (profile: string): string[] => {
  const lowerProfile = profile.toLowerCase();
  const themes = [];
  
  const keywordMap = {
    Tech: ['code', 'programming', 'computer', 'software', 'developer', 'engineer', 'python', 'java', 'javascript', 'tech', 'ai', 'machine learning', 'data', 'algorithm'],
    Physics: ['physics', 'quantum', 'relativity', 'astronomy', 'space', 'energy', 'force', 'motion', 'thermodynamics', 'particle', 'nuclear', 'mechanics', 'electromagnetism'],
    Chemistry: ['chemistry', 'chemical', 'molecule', 'atom', 'reaction', 'lab', 'organic', 'inorganic', 'biochemistry', 'compound', 'element', 'periodic table', 'synthesis'],
    Science: ['biology', 'research', 'experiment', 'scientific', 'lab work', 'analysis', 'genetics', 'microbiology', 'environmental', 'biomedical'],
    Music: ['music', 'song', 'instrument', 'guitar', 'piano', 'producer', 'sound', 'audio', 'band', 'concert', 'sing', 'compose', 'melody', 'rhythm'],
    Business: ['business', 'market', 'finance', 'management', 'entrepreneur', 'startup', 'sales', 'investment'],
    Arts: ['art', 'design', 'creative', 'drawing', 'painting', 'visual', 'graphic', 'ui/ux']
  };
  
  // Count keyword occurrences
  const themeCounts: Record<string, number> = {};
  
  Object.entries(keywordMap).forEach(([theme, keywords]) => {
    const count = keywords.filter(keyword => lowerProfile.includes(keyword)).length;
    if (count > 0) {
      themeCounts[theme] = count;
    }
  });
  
  // Only include themes with significant presence
  Object.entries(themeCounts).forEach(([theme, count]) => {
    if (count >= 2) { // Require at least 2 keyword matches
      themes.push(theme);
    }
  });
  
  // If strong physics/chemistry keywords, remove conflicting themes
  if (themes.includes('Physics') || themes.includes('Chemistry')) {
    const filtered = themes.filter(theme => 
      !['Music', 'Arts'].includes(theme)
    );
    return filtered.length > 0 ? filtered : themes;
  }
  
  return themes.length > 0 ? themes : ['Tech']; // Default to Tech
};

// ==================== ENHANCED CAREER MATCHING FOR SCIENCES ====================
export const generateCareerMatchExplanations = async (
  userProfile: string, 
  career: string, 
  careerDetails: string
): Promise<{ 
  explanation: string, 
  skillMatch: number, 
  interestMatch: number, 
  valueAlignment: number,
  overallScore: number,
  themeMismatch: boolean,
  confidence: 'high' | 'medium' | 'low'
}> => {
  // Extract user themes
  const userThemes = await extractCareerThemes(userProfile);
  console.log('Science career matching - User themes:', userThemes, 'Career:', career);
  
  // Check for theme compatibility
  const themeMismatch = checkScienceThemeMismatch(userThemes, career);
  
  // If strong mismatch (e.g., Physics user with Music career), return very low score
  if (themeMismatch === 'strong') {
    return {
      explanation: `❌ **Major Theme Mismatch**: Your profile shows strong ${userThemes.join('/')} interests, but "${career}" is typically pursued by those with different passions. We recommend exploring ${userThemes.join(' or ')}-focused careers instead.`,
      skillMatch: 15,
      interestMatch: 10,
      valueAlignment: 25,
      overallScore: 18,
      themeMismatch: true,
      confidence: 'high'
    };
  }
  
  // If moderate mismatch, score lower
  if (themeMismatch === 'moderate') {
    const baseScore = 45;
    return {
      explanation: `⚠️ **Partial Theme Alignment**: Your ${userThemes.join('/')} interests have some overlap with ${career}, but there may be better matches. Consider if you're truly passionate about this field.`,
      skillMatch: baseScore,
      interestMatch: baseScore - 10,
      valueAlignment: baseScore,
      overallScore: baseScore - 5,
      themeMismatch: true,
      confidence: 'medium'
    };
  }
  
  // SPECIAL SCIENCE PROMPTS FOR BETTER ANALYSIS
  let specializedPrompt = '';
  
  if (career.includes('Physicist') || career.includes('Physics')) {
    specializedPrompt = `**PHYSICS SPECIALIZATION**: Focus on mathematical aptitude, problem-solving skills, and interest in fundamental principles.`;
  } else if (career.includes('Chemist') || career.includes('Chemical')) {
    specializedPrompt = `**CHEMISTRY SPECIALIZATION**: Focus on lab skills, attention to detail, safety awareness, and interest in molecular interactions.`;
  } else if (career.includes('Engineer')) {
    specializedPrompt = `**ENGINEERING SPECIALIZATION**: Focus on practical application, design skills, and problem-solving.`;
  }
  
  const prompt = `Analyze career fit for SCIENCE/TECH oriented user:
  
USER PROFILE (Themes: [${userThemes.join(', ')}]): ${userProfile}

CAREER: ${career}
CAREER DETAILS: ${careerDetails}

${specializedPrompt}

**SCIENCE-SPECIFIC SCORING CRITERIA:**
1. skillMatch (0-100): Match between user's technical/math/lab skills and career requirements
2. interestMatch (0-100): Alignment between user's scientific interests and this field's research areas
3. valueAlignment (0-100): How well this career serves user's desire for discovery, innovation, or impact

**KEY CONSIDERATIONS:**
- Physics careers require strong math and abstract thinking
- Chemistry careers require lab safety awareness and precision
- Engineering careers require practical problem-solving
- If user mentions "code" but career is lab-based, adjust scores accordingly

Calculate: overallScore = (skillMatch × 0.5) + (interestMatch × 0.3) + (valueAlignment × 0.2)

Respond with JSON: {
  "explanation": "Detailed analysis considering scientific background...",
  "skillMatch": 85,
  "interestMatch": 90,
  "valueAlignment": 70,
  "overallScore": 83
}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');
  
  if (response.startsWith('ERROR:')) {
    // Science-aware fallback scoring
    const baseScore = calculateScienceBaseScore(userThemes, career);
    return {
      explanation: `Based on your ${userThemes.join(', ')} background, ${career} has approximately ${baseScore}% alignment. Physics/Chemistry careers typically require strong academic foundation in those subjects.`,
      skillMatch: baseScore,
      interestMatch: baseScore,
      valueAlignment: baseScore,
      overallScore: baseScore,
      themeMismatch: false,
      confidence: 'medium'
    };
  }
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.overallScore) {
        parsed.overallScore = Math.round(
          (parsed.skillMatch || 60) * 0.5 + 
          (parsed.interestMatch || 60) * 0.3 + 
          (parsed.valueAlignment || 60) * 0.2
        );
      }
      
      parsed.themeMismatch = false;
      parsed.confidence = 'high';
      return parsed;
    }
  } catch (e) {
    console.warn('Science career match JSON parse failed:', e);
  }
  
  // Science-based fallback
  const baseScore = calculateScienceBaseScore(userThemes, career);
  return {
    explanation: `Science career analysis: ${career} requires ${getScienceRequirements(career)}. Your ${userThemes.join(', ')} background provides ${baseScore}% foundation.`,
    skillMatch: baseScore,
    interestMatch: baseScore,
    valueAlignment: baseScore,
    overallScore: baseScore,
    themeMismatch: false,
    confidence: 'low'
  };
};

// Helper: Check science theme mismatches
const checkScienceThemeMismatch = (userThemes: string[], career: string): 'strong' | 'moderate' | 'none' => {
  // Find career in database
  for (const [theme, careers] of Object.entries(CAREER_DATABASE)) {
    const found = careers.find(c => c.name === career);
    if (found) {
      // Strong mismatch: Physics/Chemistry user with Music/Arts career
      const hasPhysicsChemistry = userThemes.some(t => ['Physics', 'Chemistry'].includes(t));
      const isMusicArts = found.requiredThemes.some(t => ['Music', 'Arts'].includes(t));
      
      if (hasPhysicsChemistry && isMusicArts) {
        return 'strong';
      }
      
      // Moderate mismatch: Some incompatible themes
      const hasIncompatible = found.incompatibleThemes.some(incomp => 
        userThemes.includes(incomp)
      );
      
      return hasIncompatible ? 'moderate' : 'none';
    }
  }
  return 'none';
};

// Helper: Calculate base score for science careers
const calculateScienceBaseScore = (userThemes: string[], career: string): number => {
  let baseScore = 50;
  
  // Bonus for theme alignment
  if (career.includes('Physics') && userThemes.includes('Physics')) baseScore += 25;
  if (career.includes('Chemistry') && userThemes.includes('Chemistry')) baseScore += 25;
  if (career.includes('Engineer') && userThemes.includes('Tech')) baseScore += 20;
  
  // Penalty for mismatches
  if (career.includes('Physics') && userThemes.includes('Music')) baseScore -= 30;
  if (career.includes('Chemistry') && userThemes.includes('Arts')) baseScore -= 30;
  
  return Math.max(10, Math.min(95, baseScore));
};

// Helper: Get science requirements for a career
const getScienceRequirements = (career: string): string => {
  if (career.includes('Physics')) return 'strong mathematics and analytical thinking';
  if (career.includes('Chemistry')) return 'lab skills and attention to detail';
  if (career.includes('Engineer')) return 'problem-solving and technical skills';
  if (career.includes('Scientist')) return 'research methodology and critical thinking';
  return 'technical or analytical skills';
};

// ==================== SPICY ACTION PLAN ====================
export const generatePersonalizedActionPlan = async (
  careerGoal: string,
  userDetails: string,
): Promise<{
  missionName: string;
  threeYearPlan: string;
  monthlyUpdates: string[];
  spicyTips: string[];
}> => {
  const prompt = `You are a Career Gamification Master. Create a spicy, unique 3-year action plan.

**CONTEXT:**
Career: "${careerGoal}"
User's Profile (Skills, Interests, etc.): "${userDetails}"

**CREATIVE CONSTRAINTS:**
1.  **Mission Name:** Invent a cool mission name (max 5 words).
2.  **Metaphors:** Use metaphors from appropriate domains:
    *   Tech careers (e.g., Software Engineer): magic, samurai, space exploration.
    *   Creative careers (e.g., Music Producer): alchemy, poetry, composition.
    *   Science careers (e.g., Researcher): expedition, discovery, wizardry.
3.  **Phases:** Include 3 phases (Beginner→Apprentice→Master) with catchy, domain-appropriate names.
4.  **Phase Content:** Each phase MUST have:
    *   2-3 "Power-Ups" (specific skills).
    *   1 "Boss Fight" (a challenging project).
    *   1 "Secret Unlock" (a networking or non-obvious opportunity).
5.  **Insider Tips:** Add 2-3 "spicyTips" (surprising but true industry advice).
6.  **Intel:** Include 3 "monthlyUpdates" (emerging tech, market trends, etc.).

**FORMAT REQUIREMENTS:**
*   'threeYearPlan' MUST be a single HTML string. Use emojis 🎮⚡🚀, <h3> for phase titles, and <ul>/<li> for lists.
*   The entire output MUST be a single, valid JSON object with NO other text, comments, or markdown.

**JSON-ONLY OUTPUT STRUCTURE:**
{
  "missionName": "Your epic mission name here",
  "threeYearPlan": "<h3>🎮 Phase 1: The Neophyte</h3><ul><li>⚡ **Power-Up:** Skill 1</li><li>...</li></ul><h3>- BOSS FIGHT -</h3><p>Project description.</p><h3>- SECRET UNLOCK -</h3><p>Opportunity description.</p>...",
  "monthlyUpdates": ["Update 1", "Update 2", "Update 3"],
  "spicyTips": ["Tip 1", "Tip 2"]
}

**START GENERATING for career: ${careerGoal}:**`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  const fallback = {
    missionName: `Mission: Conquer ${careerGoal}`,
    threeYearPlan: `<h3>🎮 Phase 1: Basic Training</h3><ul><li>⚡ **Power-Up:** Learn the fundamentals of ${careerGoal}.</li></ul><h3>- BOSS FIGHT -</h3><p>Complete a 'Hello, World!' equivalent project for this field.</p><h3>- SECRET UNLOCK -</h3><p>Find and follow one influential person in this industry on LinkedIn or X.</p><p><em>(AI plan generation failed. This is a default starter plan.)</em></p>`,
    monthlyUpdates: ["Market trends are currently unavailable.", "New tools and techniques are always emerging in every field."],
    spicyTips: ["The best way to learn is by doing real projects.", "Don't be afraid to fail; it's part of the learning process."]
  };

  if (response.startsWith('ERROR:')) {
    console.error("ModelScope API Error in Action Plan:", response);
    return fallback;
  }

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.missionName && parsed.threeYearPlan) {
        return parsed;
      }
    }
    console.warn('Action Plan generation did not return valid JSON:', response);
    return fallback;
  } catch (e) {
    console.error('Failed to parse Spicy Action Plan JSON:', e);
    return fallback;
  }
};


export const processJournalEntriesForCareerSuggestions = async (
  journalEntries: string,
  feelings: string
): Promise<{ careerSuggestions: string, analysis: string }> => {
  const prompt = `Analyze the user's journal entries and feelings to provide career suggestions and a brief analysis.

  JOURNAL ENTRIES:
  "${journalEntries}"
  
  FEELINGS SUMMARY:
  "${feelings}"
  
  **INSTRUCTIONS:**
  - Identify recurring themes, interests, and pain points in the journal entries.
  - Connect these themes to potential career fields or specific jobs.
  - Provide a brief "analysis" of the user's mindset based on their writing.
  - List 3-5 "careerSuggestions" that seem like a good fit.
  - Format the output as a JSON object with two keys: "analysis" and "careerSuggestions".
  
  EXAMPLE RESPONSE:
  {
    "analysis": "You seem to feel most fulfilled when working on creative projects that have a tangible outcome. You often express frustration with repetitive tasks.",
    "careerSuggestions": "1. UX/UI Designer\\n2. Content Creator / Youtuber\\n3. Project Manager in a creative agency"
  }`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  if (response.startsWith('ERROR:')) {
      return {
          analysis: 'Could not analyze your journal at this time due to an API error.',
          careerSuggestions: 'Please try again later.'
      };
  }

  try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
      }
      // Fallback if no JSON is found
      return {
          analysis: 'Analysis could not be parsed.',
          careerSuggestions: response
      };
  } catch (e) {
      console.warn('Journal processing JSON parse failed:', e);
      return {
          analysis: 'There was an issue parsing the AI response.',
          careerSuggestions: 'No suggestions could be generated at this time.'
      };
  }
};
