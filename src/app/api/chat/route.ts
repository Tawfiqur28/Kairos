
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { academicChat } from '@/ai/flows/academic-chat-flow';

export const runtime = 'nodejs';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  imageDataUri: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, imageDataUri } = ChatRequestSchema.parse(body);

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('ERROR: Last message must be from user.', { status: 400 });
    }

    // Prepare history for Genkit flow (excluding the last message)
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user' as any,
      content: msg.content
    }));

    // Implement retry logic with exponential backoff
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        const result = await academicChat({
          message: lastMessage.content,
          history,
          imageDataUri
        });

        return new Response(result.response, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      } catch (error: any) {
        attempts++;
        lastError = error;
        console.warn(`AI attempt ${attempts} failed:`, error.message);
        
        if (attempts < maxAttempts) {
          const delay = Math.pow(2, attempts) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return new Response(`ERROR: AI processing failed after ${maxAttempts} attempts. ${lastError?.message || ''}`, { status: 500 });

  } catch (error) {
    console.error('[Chat API Error]', error);
    return new Response(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
