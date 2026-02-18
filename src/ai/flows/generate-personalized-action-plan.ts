'use server';
/**
 * @fileOverview Generates a 3-year personalized action plan for career goals.
 */

import { z } from 'zod';
import { callModelScopeAI } from '@/ai/utils';

const GeneratePersonalizedActionPlanInputSchema = z.object({
  careerGoal: z.string().min(2, 'Career goal must be at least 2 characters').describe('The user\'s desired career goal.'),
  userDetails: z
    .string()
    .min(10, 'User details must be at least 10 characters')
    .describe('Details about the user, including their current education level, skills, and interests.'),
  useAIFallback: z.boolean().optional().default(true).describe('Use AI as fallback if local generation fails')
});

export type GeneratePersonalizedActionPlanInput = z.infer<
  typeof GeneratePersonalizedActionPlanInputSchema
>;

const PlanTaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
});

const PlanPhaseSchema = z.object({
  title: z.string(),
  duration: z.string(),
  tasks: z.array(PlanTaskSchema),
});

const GeneratePersonalizedActionPlanOutputSchema = z.object({
  careerTitle: z.string(),
  educationLevel: z.string(),
  timeline: z.string(),
  phases: z.array(PlanPhaseSchema),
  generatedAt: z.string().optional(),
  success: z.boolean().optional(),
});

export type GeneratePersonalizedActionPlanOutput = z.infer<
  typeof GeneratePersonalizedActionPlanOutputSchema
>;

const getEducationLevelPrompt = (educationLevel?: string): string => {
  const prompts = {
    high_school: `For HIGH SCHOOL student: Focus on foundational skills, college prep, and exploration. Suggest AP courses, extracurriculars, and summer programs. Timeline: 4-6 years to entry level.`,
    undergrad: `For UNDERGRADUATE student: Focus on major courses, internships, skill-building, and networking. Timeline: 2-4 years to entry level.`,
    masters: `For MASTER'S student: Focus on specialization, research projects, professional networking, and industry connections. Timeline: 1-3 years to specialized role.`,
    phd: `For PhD student: Focus on research contribution, publication strategy, academic networking, and career positioning. Timeline: Variable based on dissertation completion.`,
    professional: `For a WORKING PROFESSIONAL: Focus on upskilling, certifications, networking for senior roles, and transitioning skills. Timeline: 1-2 years to pivot or advance.`
  };
  
  return (prompts as any)[educationLevel as any] || 'Provide general career guidance.';
};


const extractEducationLevelFromDetails = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  if (details.includes('high school') || details.includes('highschool')) return 'high_school';
  if (details.includes('undergraduate') || details.includes('bachelor') || details.includes('college')) return 'undergrad';
  if (details.includes('master') || details.includes('graduate')) return 'masters';
  if (details.includes('phd') || details.includes('doctorate')) return 'phd';
  if (details.includes('professional') || details.includes('working')) return 'professional';
  return 'not_specified';
};

const generatePersonalizedActionPlanFromModel = async (
  careerGoal: string,
  userDetails: string
): Promise<GeneratePersonalizedActionPlanOutput> => {
  const extractedLevel = extractEducationLevelFromDetails(userDetails);
  
  const prompt = `Create a SPICY, engaging 3-year action plan for becoming a '${careerGoal}'.
  
User Profile: "${userDetails}"
Education Level: "${extractedLevel}"

**REQUIREMENTS:**
1. Tailor ALL content to ${extractedLevel} level
2. Include 3 phases with catchy names
3. Each phase must have 3-4 actionable tasks
4. Use emojis and motivational language

**EDUCATION-LEVEL SPECIFIC:**
${getEducationLevelPrompt(extractedLevel)}

**FORMAT (STRICT JSON):**
{
  "careerTitle": "${careerGoal}",
  "educationLevel": "${extractedLevel}",
  "timeline": "3-Year Journey to ${careerGoal}",
  "phases": [
    {
      "title": "Phase 1: Catchy Name",
      "duration": "Months 1-12",
      "tasks": [
        { "id": "task-1-1", "text": "Actionable task", "completed": false }
      ]
    }
  ]
}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  if (response.startsWith('ERROR:')) {
    throw new Error(response);
  }

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.phases) {
        return GeneratePersonalizedActionPlanOutputSchema.parse(parsed);
      }
  }

  throw new Error("Failed to parse AI response for action plan.");
};


// Helper function to extract education level from user details
const extractEducationLevel = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  
  if (details.includes('phd') || details.includes('doctorate')) return 'PhD';
  if (details.includes('master') || details.includes('graduate')) return 'Master\'s';
  if (details.includes('bachelor') || details.includes('undergrad') || details.includes('college')) return 'Undergraduate';
  if (details.includes('associate') || details.includes('diploma')) return 'Associate Degree';
  if (details.includes('high school') || details.includes('secondary')) return 'High School';
  if (details.includes('professional') || details.includes('working') || details.includes('employed')) return 'Professional';
  if (details.includes('student')) return 'Student';
  
  return 'Not Specified';
};

// Helper function to extract skills/interests from user details
const extractSkillsAndInterests = (userDetails: string): string[] => {
  const details = userDetails.toLowerCase();
  const skills: string[] = [];
  
  // Technical skills
  if (details.includes('programming') || details.includes('code') || details.includes('developer')) skills.push('Programming');
  if (details.includes('data') || details.includes('analysis') || details.includes('analytics')) skills.push('Data Analysis');
  if (details.includes('design') || details.includes('ui') || details.includes('ux')) skills.push('Design');
  if (details.includes('math') || details.includes('calculus') || details.includes('statistics')) skills.push('Mathematics');
  if (details.includes('science') || details.includes('physics') || details.includes('chemistry')) skills.push('Science');
  if (details.includes('business') || details.includes('marketing') || details.includes('finance')) skills.push('Business');
  if (details.includes('music') || details.includes('art') || details.includes('creative')) skills.push('Creative Arts');
  if (details.includes('writing') || details.includes('communication') || details.includes('content')) skills.push('Communication');
  
  return skills.length > 0 ? skills : ['General Skills'];
};

// Local plan generation function (to avoid dependency on external service)
const generateLocalActionPlan = (
  careerGoal: string,
  userDetails: string,
  educationLevel: string,
  skills: string[]
): GeneratePersonalizedActionPlanOutput => {
  // Base timeline based on education level
  let timeline = '3-Year Career Development Plan';
  let phaseDuration1 = 'Months 1-6';
  let phaseDuration2 = 'Months 7-18';
  let phaseDuration3 = 'Months 19-36';
  
  if (educationLevel === 'High School') {
    timeline = '4-Year University & Career Preparation Plan';
    phaseDuration1 = 'Grade 11/12';
    phaseDuration2 = 'University Years 1-2';
    phaseDuration3 = 'University Years 3-4';
  } else if (educationLevel === 'Undergraduate') {
    timeline = '3-Year Undergraduate to Career Transition';
    phaseDuration1 = 'Remaining Undergraduate';
    phaseDuration2 = 'Graduation Year';
    phaseDuration3 = 'First Year Post-Graduation';
  } else if (educationLevel === 'Professional') {
    timeline = '2-Year Career Advancement Plan';
    phaseDuration1 = 'Next 6 Months';
    phaseDuration2 = 'Months 7-18';
    phaseDuration3 = 'Months 19-24';
  }
  
  // Generate tasks based on career type
  const careerLower = careerGoal.toLowerCase();
  let phase1Tasks = [];
  let phase2Tasks = [];
  let phase3Tasks = [];
  
  // Tech/Software careers
  if (careerLower.includes('software') || careerLower.includes('developer') || careerLower.includes('engineer')) {
    phase1Tasks = [
      { id: 'tech-1-1', text: 'Master one programming language (Python, JavaScript, or Java)', completed: false },
      { id: 'tech-1-2', text: 'Learn Git version control and create GitHub profile', completed: false },
      { id: 'tech-1-3', text: 'Complete a data structures and algorithms course', completed: false },
      { id: 'tech-1-4', text: 'Build a simple portfolio website or project', completed: false }
    ];
    
    phase2Tasks = [
      { id: 'tech-2-1', text: 'Learn a popular framework (React, Node.js, Spring, etc.)', completed: false },
      { id: 'tech-2-2', text: 'Complete 2-3 substantial portfolio projects', completed: false },
      { id: 'tech-2-3', text: 'Contribute to open-source projects on GitHub', completed: false },
      { id: 'tech-2-4', text: 'Practice coding interview problems (LeetCode, HackerRank)', completed: false }
    ];
    
    phase3Tasks = [
      { id: 'tech-3-1', text: 'Apply for internships or entry-level positions', completed: false },
      { id: 'tech-3-2', text: 'Network with developers and recruiters on LinkedIn', completed: false },
      { id: 'tech-3-3', text: 'Prepare for technical and behavioral interviews', completed: false },
      { id: 'tech-3-4', text: 'Secure a mentor in the software engineering field', completed: false }
    ];
  }
  // Data Science careers
  else if (careerLower.includes('data') || careerLower.includes('analyst') || careerLower.includes('scientist')) {
    phase1Tasks = [
      { id: 'data-1-1', text: 'Learn Python for data analysis (Pandas, NumPy)', completed: false },
      { id: 'data-1-2', text: 'Study statistics and probability fundamentals', completed: false },
      { id: 'data-1-3', text: 'Complete SQL database fundamentals course', completed: false },
      { id: 'data-1-4', text: 'Work with a simple dataset for analysis practice', completed: false }
    ];
    
    phase2Tasks = [
      { id: 'data-2-1', text: 'Learn data visualization (Matplotlib, Seaborn, Tableau)', completed: false },
      { id: 'data-2-2', text: 'Study machine learning fundamentals', completed: false },
      { id: 'data-2-3', text: 'Complete a Kaggle competition or dataset analysis', completed: false },
      { id: 'data-2-4', text: 'Build a data analysis portfolio with 2-3 projects', completed: false }
    ];
    
    phase3Tasks = [
      { id: 'data-3-1', text: 'Apply for data internships or junior analyst roles', completed: false },
      { id: 'data-3-2', text: 'Network with data professionals on LinkedIn and at meetups', completed: false },
      { id: 'data-3-3', text: 'Prepare for case study and technical interviews', completed: false },
      { id: 'data-3-4', text: 'Consider certifications (Google Data Analytics, IBM Data Science)', completed: false }
    ];
  }
  // Generic/default career plan
  else {
    phase1Tasks = [
      { id: 'gen-1-1', text: `Research ${careerGoal} career requirements and qualifications`, completed: false },
      { id: 'gen-1-2', text: 'Identify 3-5 core skills needed and assess your current level', completed: false },
      { id: 'gen-1-3', text: `Take an introductory course about ${careerGoal}`, completed: false },
      { id: 'gen-1-4', text: 'Connect with 2 professionals in the field for informational interviews', completed: false }
    ];
    
    phase2Tasks = [
      { id: 'gen-2-1', text: `Develop a portfolio or project demonstrating ${careerGoal} skills`, completed: false },
      { id: 'gen-2-2', text: 'Complete intermediate-level training or certification', completed: false },
      { id: 'gen-2-3', text: 'Attend industry events, webinars, or conferences', completed: false },
      { id: 'gen-2-4', text: 'Start documenting your learning journey (blog, GitHub, portfolio)', completed: false }
    ];
    
    phase3Tasks = [
      { id: 'gen-3-1', text: 'Apply for relevant positions, internships, or freelance work', completed: false },
      { id: 'gen-3-2', text: 'Prepare comprehensive interview materials and practice sessions', completed: false },
      { id: 'gen-3-3', text: 'Optimize your resume, LinkedIn, and professional profiles', completed: false },
      { id: 'gen-3-4', text: 'Secure mentorship or coaching in your target field', completed: false }
    ];
  }
  
  return {
    careerTitle: careerGoal,
    educationLevel,
    timeline: `${timeline} for ${careerGoal}`,
    phases: [
      {
        title: 'Phase 1: Foundation & Exploration',
        duration: phaseDuration1,
        tasks: phase1Tasks
      },
      {
        title: 'Phase 2: Skill Development & Building',
        duration: phaseDuration2,
        tasks: phase2Tasks
      },
      {
        title: 'Phase 3: Career Entry & Advancement',
        duration: phaseDuration3,
        tasks: phase3Tasks
      }
    ],
    generatedAt: new Date().toISOString(),
    success: true
  };
};

export async function generatePersonalizedActionPlan(
  input: GeneratePersonalizedActionPlanInput
): Promise<GeneratePersonalizedActionPlanOutput> {
  try {
    // Validate input
    const validatedInput = GeneratePersonalizedActionPlanInputSchema.parse(input);
    
    // Extract education level and skills locally
    const educationLevel = extractEducationLevel(validatedInput.userDetails);
    const skills = extractSkillsAndInterests(validatedInput.userDetails);
    
    let plan: GeneratePersonalizedActionPlanOutput;
    
    // Try AI generation first if enabled
    if (validatedInput.useAIFallback) {
      try {
        console.log('Attempting AI plan generation...');
        const aiPlan = await generatePersonalizedActionPlanFromModel(
          validatedInput.careerGoal, 
          validatedInput.userDetails
        );
        
        // Validate AI plan structure
        if (aiPlan && aiPlan.phases && aiPlan.phases.length >= 2) {
          plan = {
            ...aiPlan,
            educationLevel: aiPlan.educationLevel || educationLevel,
            generatedAt: new Date().toISOString(),
            success: true
          };
          console.log('AI plan generation successful');
        } else {
          throw new Error('AI plan structure invalid');
        }
      } catch (aiError) {
        console.warn('AI plan generation failed, using local generation:', aiError);
        // Fall back to local generation
        plan = generateLocalActionPlan(
          validatedInput.careerGoal,
          validatedInput.userDetails,
          educationLevel,
          skills
        );
      }
    } else {
      // Use local generation directly
      plan = generateLocalActionPlan(
        validatedInput.careerGoal,
        validatedInput.userDetails,
        educationLevel,
        skills
      );
    }
    
    // Ensure all tasks have unique IDs
    plan.phases.forEach((phase, phaseIndex) => {
      phase.tasks.forEach((task, taskIndex) => {
        if (!task.id || !task.id.startsWith('task-')) {
          task.id = `phase-${phaseIndex + 1}-task-${taskIndex + 1}`;
        }
      });
    });
    
    // Validate and return the final plan
    return GeneratePersonalizedActionPlanOutputSchema.parse({
      ...plan,
      success: true
    });
    
  } catch (error) {
    console.error('Error generating personalized action plan:', error);
    
    // Emergency fallback - always returns a valid plan
    const emergencyPlan: GeneratePersonalizedActionPlanOutput = {
      careerTitle: input.careerGoal || 'Your Career Goal',
      educationLevel: 'Not Specified',
      timeline: 'Career Development Journey',
      phases: [
        {
          title: 'Getting Started',
          duration: 'Immediate',
          tasks: [
            { id: 'emergency-1', text: `Research ${input.careerGoal || 'your chosen career'} online`, completed: false },
            { id: 'emergency-2', text: 'Identify one skill you can start learning today', completed: false },
            { id: 'emergency-3', text: 'Connect with one professional in your target field', completed: false }
          ]
        },
        {
          title: 'Next Steps',
          duration: 'Next 3-6 Months',
          tasks: [
            { id: 'emergency-4', text: 'Take an online course related to your career interest', completed: false },
            { id: 'emergency-5', text: 'Build a simple project to practice your skills', completed: false },
            { id: 'emergency-6', text: 'Update your resume and LinkedIn profile', completed: false }
          ]
        }
      ],
      generatedAt: new Date().toISOString(),
      success: false
    };
    
    return GeneratePersonalizedActionPlanOutputSchema.parse(emergencyPlan);
  }
}
