'use server';

/**
 * @fileOverview A conversational AI assistant for student guidance.
 */

import { z } from 'zod';
import { kairosChat as kairosChatFromModel } from '@/ai/genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const KairosChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  history: z.array(ChatMessageSchema).optional(),
  userProfile: z.string().optional(),
});
export type KairosChatInput = z.infer<typeof KairosChatInputSchema>;

const KairosChatOutputSchema = z.object({
  message: z.string(),
});
export type KairosChatOutput = z.infer<typeof KairosChatOutputSchema>;

export async function kairosChat(input: KairosChatInput): Promise<KairosChatOutput> {
  try {
    const responseMessage = await kairosChatFromModel(input);
    return KairosChatOutputSchema.parse({ message: responseMessage });
  } catch (error) {
    console.error('Error in kairosChat flow:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Output validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Failed to get response from AI assistant.');
  }
}
