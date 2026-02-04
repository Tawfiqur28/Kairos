'use server';

/**
 * @fileOverview A conversational AI assistant for comprehensive student guidance.
 */

import { z } from 'zod';
import { kairosChat as kairosChatFromModel } from '@/ai/genkit';

// Enhanced message schema with metadata
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.object({
    educationLevel: z.enum(['high_school', 'undergrad', 'masters', 'phd']).optional(),
    subject: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional(),
    context: z.string().optional(),
  }).optional(),
});

const KairosChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  history: z.array(ChatMessageSchema).optional(),
  userProfile: z.string().optional(),
  educationLevel: z.enum(['high_school', 'undergrad', 'masters', 'phd']).optional(),
  currentSubject: z.string().optional(),
  needsProfessorMatch: z.boolean().optional(),
  assignmentDetails: z.object({
    subject: z.string().optional(),
    deadline: z.string().optional(),
    wordCount: z.number().optional(),
    requirements: z.string().optional(),
  }).optional(),
});
export type KairosChatInput = z.infer<typeof KairosChatInputSchema>;

const KairosChatOutputSchema = z.object({
  message: z.string(),
  suggestions: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['video', 'article', 'book', 'tool']),
  })).optional(),
  nextSteps: z.array(z.string()).optional(),
  professorMatches: z.array(z.object({
    name: z.string(),
    institution: z.string(),
    researchArea: z.string(),
    contactTips: z.string(),
  })).optional(),
});
export type KairosChatOutput = z.infer<typeof KairosChatOutputSchema>;

export async function kairosChat(input: KairosChatInput): Promise<KairosChatOutput> {
  try {
    const enhancedInput = enhanceWithContext(input);
    const response = await kairosChatFromModel(enhancedInput);
    return KairosChatOutputSchema.parse(response);
  } catch (error) {
    console.error('Error in kairosChat flow:', error);
    
    // Fallback responses by education level
    const fallbackByLevel = {
      high_school: "I can help with homework, study strategies, and college prep! What subject are you working on?",
      undergrad: "I can assist with assignments, project ideas, and finding academic resources. What do you need help with?",
      masters: "I can help with research methodology, literature review, and connecting with professors. What's your research topic?",
      phd: "I can assist with dissertation structure, publication strategy, and academic networking. What aspect of your research needs attention?"
    };
    
    const fallbackMessage = fallbackByLevel[input.educationLevel || 'high_school'];
    
    return {
      message: `I'm having trouble connecting to advanced features. ${fallbackMessage}`,
      suggestions: ['Try rephrasing your question', 'Check your internet connection', 'Use simpler keywords'],
    };
  }
}

// Context enhancement function
function enhanceWithContext(input: KairosChatInput): any {
  const basePrompt = `You are KAIROS ACADEMIC ASSISTANT, a specialized chatbot for student support.`;
  
  const levelSpecificPrompts = {
    high_school: `You're helping a HIGH SCHOOL student. Focus on foundational concepts, exam preparation, college applications, and study skills.`,
    undergrad: `You're helping an UNDERGRADUATE student. Focus on coursework, assignments, project guidance, internship advice, and foundational research.`,
    masters: `You're helping a MASTER'S student. Focus on research methodology, literature review, thesis writing, conference preparation, and specialization advice.`,
    phd: `You're helping a PhD student. Focus on dissertation structure, publication strategy, academic networking, grant writing, and career positioning.`
  };
  
  const contextPrompt = levelSpecificPrompts[input.educationLevel || 'high_school'];
  
  // Add professor matching logic if requested
  if (input.needsProfessorMatch) {
    return `${basePrompt} ${contextPrompt}
    
    USER IS LOOKING FOR PROFESSOR MATCHES. Analyze their research interests and suggest suitable professors.
    User's research interests: ${input.message}
    
    Provide 3-5 professor matches with: Name, University, Research Area, and contact tips.
    Also suggest how to approach them (email template suggestions).
    
    Format professor matches as JSON array.`;
  }
  
  // Add assignment help logic
  if (input.assignmentDetails) {
    return `${basePrompt} ${contextPrompt}
    
    USER NEEDS ASSIGNMENT HELP. Provide structured guidance.
    Assignment details: ${JSON.stringify(input.assignmentDetails)}
    
    Provide: 1. Outline structure 2. Key concepts 3. Common pitfalls 4. Resources 5. Time management tips.`;
  }
  
  return `${basePrompt} ${contextPrompt}
  
  User message: ${input.message}
  User profile context: ${input.userProfile || 'No additional context provided.'}
  
  Respond in a helpful, encouraging tone specific to their education level.`;
}