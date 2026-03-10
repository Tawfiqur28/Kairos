
'use server';
/**
 * @fileOverview Academic Assistant Chat Flow.
 * 
 * - academicChat - Handles academic questions and math problem solving.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AcademicChatInputSchema = z.object({
  message: z.string().describe("The user's question or math problem."),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('Chat history for context.'),
  imageDataUri: z.string().optional().describe("Optional image data URI of a math problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type AcademicChatInput = z.infer<typeof AcademicChatInputSchema>;

const AcademicChatOutputSchema = z.object({
  response: z.string().describe("The AI's step-by-step academic response."),
});

export async function academicChat(input: AcademicChatInput) {
  return academicChatFlow(input);
}

const academicChatFlow = ai.defineFlow(
  {
    name: 'academicChatFlow',
    inputSchema: AcademicChatInputSchema,
    outputSchema: AcademicChatOutputSchema,
  },
  async (input) => {
    // Map 'assistant' role to 'model' which Genkit/Gemini expects
    const mappedHistory = (input.history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user' as any,
      content: [{ text: msg.content }]
    }));

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `You are KAIROS Academic Assistant, a rigorous yet empathetic math and science tutor.
      When solving math problems:
      1. Identify the core concepts.
      2. Provide a clear, step-by-step written solution.
      3. Use LaTeX for all mathematical notation (e.g., $x^2$).
      4. Explain the "why" behind each step.
      5. If an image is provided, focus on extracting and solving the problem shown.
      
      Always be encouraging and maintain a high academic standard.`,
      messages: [
        ...mappedHistory,
        {
          role: 'user',
          content: [
            { text: input.message },
            ...(input.imageDataUri ? [{ media: { url: input.imageDataUri } }] : [])
          ]
        }
      ],
    });

    return { response: response.text };
  }
);
