import type { EducationLevel } from '@/lib/types';
import { z } from 'zod';
import { NextRequest } from 'next/server';

// Helper function to provide context based on education level
const getEducationLevelChatContext = (educationLevel?: string): string => {
  const contexts = {
    highSchool: `HIGH SCHOOL focus: Foundational concepts, exam prep, college applications, study skills, time management.`,
    undergrad: `UNDERGRAD focus: Coursework, assignments, projects, internships, networking, grad school prep.`,
    masters: `MASTER'S focus: Research methodology, thesis writing, specialization, professional networking.`,
    phd: `PhD focus: Dissertation, publications, academic networking, grant writing, career positioning.`,
    professional: `PROFESSIONAL focus: Upskilling, career change, leadership, work-life balance, and industry trends.`
  };
  return (contexts as any)[educationLevel as any] || 'Provide general student and career guidance.';
};

// Simulated web search function
async function searchWeb(query: string): Promise<string> {
    console.log(`Simulating web search for: "${query}"`);
    // In a real application, you would call a search API like SerpAPI, Google Search API, etc.
    // For this simulation, we return a static, helpful response.
    if (query.toLowerCase().includes('next.js 15')) {
        return `Web Search Results for "Next.js 15 features":\n- React 19 and the new React Compiler.\n- Partial Prerendering (experimental).\n- Improved caching and performance optimizations.\n- More intuitive fetching and data handling.`;
    }
    if (query.toLowerCase().includes('ikigai')) {
        return `Web Search Results for "ikigai":\n- Ikigai is a Japanese concept that means "a reason for being."\n- It's the intersection of what you love, what you're good at, what the world needs, and what you can be paid for.\n- Finding your Ikigai is believed to lead to a more fulfilling and happy life.`;
    }
    return `No specific web search results found for "${query}". Try a different query.`;
}

// Schema for validating the incoming request body
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, ikigai } = ChatRequestSchema.parse(body);

    const educationLevel = ikigai?.educationLevel;
    const userProfileString = `Passions: ${ikigai?.passions || 'N/A'}. Skills: ${ikigai?.skills || 'N/A'}. Values: ${ikigai?.values || 'N/A'}. Interests: ${ikigai?.interests || 'N/A'}. Current Education Level: ${educationLevel || 'N/A'}.`;

    let lastUserMessageContent = messages[messages.length - 1]?.content || '';
    
    let searchResultsContext = '';
    // Check if the user's message implies a search query
    if (lastUserMessageContent.toLowerCase().startsWith('search for:') || lastUserMessageContent.toLowerCase().startsWith('what is ')) {
        const searchQuery = lastUserMessageContent.replace(/^(search for:|what is)\s*/i, '');
        const searchResults = await searchWeb(searchQuery);
        searchResultsContext = `\n\n**Web Search Results:**\n${searchResults}`;
    }

    const systemPrompt = `You are KAIROS, a specialized, empathetic, and highly knowledgeable AI assistant for academic and career guidance. Provide detailed, actionable, and structured answers. Use markdown for formatting like lists, bold text, and code snippets where appropriate.

**USER'S EDUCATION LEVEL: ${educationLevel?.toUpperCase() || 'NOT SPECIFIED'}**
${getEducationLevelChatContext(educationLevel)}

**USER'S PROFILE:** ${userProfileString}

**CONTEXT:** If web search results are provided below, use them to inform your answer.
${searchResultsContext}

**RESPONSE FORMAT:** Always provide comprehensive, well-structured, and helpful responses. Be proactive and encouraging.`;

    const modelMessages = [
      { role: 'system', content: systemPrompt },
      // include all messages
      ...messages
    ];

    // Get the base URL for the current request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Call the new ModelScope API route
    const response = await fetch(`${baseUrl}/api/chat/modelscope`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: modelMessages, model: 'qwen-max' }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to get response from model API');
    }
    
    // Stream the response back to the client
    return new Response(response.body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof z.ZodError) {
      errorMessage = 'Invalid request body.';
      console.error('[Chat API ZodError]', error.errors);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('[Chat API Error]', error);
    return new Response(`ERROR: ${errorMessage}`, { status: 500 });
  }
}
