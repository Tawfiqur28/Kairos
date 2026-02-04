import { NextRequest } from 'next/server';

// Reuse your existing code but in an API route context
let dashscopeGeneration: any;
async function getDashscopeGeneration() {
  if (!dashscopeGeneration) {
    try {
      const { Generation } = await import('dashscope');
      dashscopeGeneration = Generation;
    } catch (e) {
      console.error('Failed to import dashscope', e);
      return null;
    }
  }
  return dashscopeGeneration;
}

export const runtime = 'edge'; // or 'nodejs' depending on your needs

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'qwen-max' } = await request.json();
    const API_KEY = process.env.MODELSCOPE_API_KEY;

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      return new Response(
        JSON.stringify({ error: 'ModelScope API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const Generation = await getDashscopeGeneration();
    if (!Generation) {
      throw new Error('Dashscope module could not be loaded');
    }

    // For streaming response
    const result = await Generation.call({
      model: model,
      messages: messages,
      apiKey: API_KEY,
      stream: true,
    });

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const chunk of result) {
            const newContent = chunk.output?.choices?.[0]?.message?.content || '';
            if (newContent && newContent !== fullContent) {
              const diff = newContent.substring(fullContent.length);
              if (diff) {
                controller.enqueue(encoder.encode(diff));
              }
              fullContent = newContent;
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
