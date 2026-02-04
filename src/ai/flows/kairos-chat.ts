'use server';

/**
 * @fileOverview A conversational AI assistant for comprehensive student guidance.
 */

import { z } from 'zod';
import { kairosChat as kairosChatFromModel } from '@/ai/genkit';

// This schema should match what the client sends.
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.any().optional(), // Keep it simple
});

const KairosChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  history: z.array(ChatMessageSchema).optional(),
  userProfile: z.string().optional(),
  educationLevel: z.enum(['highSchool', 'undergrad', 'masters', 'phd']).optional(),
  currentSubject: z.string().optional(),
  needsProfessorMatch: z.boolean().optional(),
  assignmentDetails: z.any().optional(),
});
export type KairosChatInput = z.infer<typeof KairosChatInputSchema>;


// Output schema can remain the same
const KairosChatOutputSchema = z.object({
  message: z.string(),
  suggestions: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['video', 'article', 'book', 'tool']),
  })).optional(),
  nextSteps: z.array(z.string()).optional(),
  professorMatches: z.array(z.any()).optional(),
});
export type KairosChatOutput = z.infer<typeof KairosChatOutputSchema>;


// The main flow function
export async function kairosChat(input: KairosChatInput): Promise<KairosChatOutput> {
  try {
    // Validate input against the schema
    const validatedInput = KairosChatInputSchema.parse(input);

    // Map educationLevel from camelCase to snake_case for the AI model
    const modelEducationLevel = validatedInput.educationLevel === 'highSchool'
      ? 'high_school'
      : validatedInput.educationLevel;

    // Prepare the input for the AI model call
    const modelInput = {
      ...validatedInput,
      educationLevel: modelEducationLevel,
    };
    
    // Call the core AI function from genkit
    const response = await kairosChatFromModel(modelInput);
    
    // Parse and return the response
    return KairosChatOutputSchema.parse(response);

  } catch (error) {
    console.error('Error in kairosChat flow:', error);
    
    const fallbackByLevel = {
      highSchool: "I can help with homework, study strategies, and college prep! What subject are you working on?",
      undergrad: "I can assist with assignments, project ideas, and finding academic resources. What do you need help with?",
      masters: "I can help with research methodology, literature review, and connecting with professors. What's your research topic?",
      phd: "I can assist with dissertation structure, publication strategy, and academic networking. What aspect of your research needs attention?"
    };
    
    const educationKey = input.educationLevel || 'highSchool';
    const fallbackMessage = fallbackByLevel[educationKey as keyof typeof fallbackByLevel];
    
    return {
      message: `I'm having trouble connecting to advanced features. ${fallbackMessage}`,
      suggestions: ['Try rephrasing your question', 'Check your internet connection', 'Use simpler keywords'],
    };
  }
}
