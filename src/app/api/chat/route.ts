import { callModelScopeChatStream } from '@/ai/genkit';
import type { EducationLevel } from '@/lib/types';
import { z } from 'zod';

// Helper function to provide context based on education level
const getEducationLevelChatContext = (educationLevel?: string): string => {
  const contexts = {
    high_school: `HIGH SCHOOL focus: Foundational concepts, exam prep, college applications, study skills, time management.`,
    undergrad: `UNDERGRAD focus: Coursework, assignments, projects, internships, networking, grad school prep.`,
    masters: `MASTER'S focus: Research methodology, thesis writing, specialization, professional networking.`,
    phd: `PhD focus: Dissertation, publications, academic networking, grant writing, career positioning.`,
    professional: `PROFESSIONAL focus: Upskilling, career change, leadership, work-life balance, and industry trends.`
  };
  return (contexts as any)[educationLevel as any] || 'Provide general student and career guidance.';
};

// Schema for validating the incoming request body
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  ikigai: z.object({
    passions: z.string().optional(),
    skills: z.string().optional(),
    values: z.string().optional(),
    interests: z.string().optional(),
    educationLevel: z.enum(['highSchool', 'undergrad', 'masters', 'phd', 'professional']).optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, ikigai } = ChatRequestSchema.parse(body);

    const educationLevel = ikigai?.educationLevel;
    const userProfileString = `Passions: ${ikigai?.passions || 'N/A'}. Skills: ${ikigai?.skills || 'N/A'}. Values: ${ikigai?.values || 'N/A'}. Interests: ${ikigai?.interests || 'N/A'}. Current Education Level: ${educationLevel || 'N/A'}.`;

    const modelEducationLevel = educationLevel === 'highSchool' ? 'high_school' : educationLevel;

    const systemPrompt = `You are KAIROS, a specialized, empathetic, and highly knowledgeable AI assistant for academic and career guidance, similar to top-tier assistants like Gemini. Provide detailed, actionable, and structured answers. Use markdown for formatting like lists, bold text, and code snippets where appropriate.

**EDUCATION LEVEL: ${modelEducationLevel?.toUpperCase() || 'NOT SPECIFIED'}**
${getEducationLevelChatContext(modelEducationLevel)}

User Profile: ${userProfileString}

**RESPONSE FORMAT:** Always provide comprehensive, well-structured, and helpful responses. Be proactive and encouraging.`;

    const lastUserMessage = messages.pop();
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
        return new Response('Error: No user message found.', { status: 400 });
    }

    const modelMessages = [
      { role: 'system', content: systemPrompt },
      ...messages, // older history
      lastUserMessage // the latest message
    ];
    
    const streamGenerator = callModelScopeChatStream(modelMessages, 'qwen-max');
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamGenerator) {
          if (chunk.startsWith('ERROR:')) {
            controller.enqueue(encoder.encode(chunk));
            controller.close();
            return;
          }
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof z.ZodError) {
      errorMessage = 'Invalid request body.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('[Chat API Error]', error);
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}

// To prevent issues with some hosting providers, we can specify the runtime.
export const runtime = 'edge';
