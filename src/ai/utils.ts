'use server';

// Lazily import dashscope to improve initial load time.
let dashscopeGeneration: any;
async function getDashscopeGeneration() {
  if (!dashscopeGeneration) {
    const dashscope = await import('dashscope');
    dashscopeGeneration = dashscope.Generation;
  }
  return dashscopeGeneration;
}

/**
 * Calls the ModelScope API with a given prompt and model.
 * @param prompt The prompt to send to the model.
 * @param model The model to use for the generation.
 * @returns The text output from the model or an error string.
 */
export async function callModelScopeAI(prompt: string, model: string): Promise<string> {
  const API_KEY = process.env.MODELSCOPE_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    const errorMsg = 'ERROR: ModelScope API key not configured. Please add it to your .env file.';
    console.error(errorMsg);
    return errorMsg;
  }

  try {
    const Generation = await getDashscopeGeneration();
    const result = await Generation.call({
      model: model,
      prompt: prompt,
      apiKey: API_KEY,
    });

    if (result.statusCode === 200 && result.output && result.output.text) {
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
      const errorMsg = `ERROR: API call failed with status ${result.statusCode}. Message: ${result.message}`;
      console.error('ModelScope API Error:', result);
      return errorMsg;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorMsg = `ERROR: An unexpected error occurred while calling the AI model. Details: ${errorMessage}`;
    console.error('Error calling ModelScope API:', error);
    return errorMsg;
  }
}


/**
 * Calls the ModelScope Chat API with a stream of messages.
 * @param messages A list of messages in the conversation.
 * @param model The model to use.
 * @returns An async generator that yields the content chunks.
 */
export async function* callModelScopeChatStream(messages: {role: string, content: string}[], model: string): AsyncGenerator<string> {
  const API_KEY = process.env.MODELSCOPE_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    const errorMsg = 'ERROR: ModelScope API key not configured. Please add it to your .env file.';
    console.error(errorMsg);
    yield errorMsg;
    return;
  }

  try {
    const Generation = await getDashscopeGeneration();
    const result = await Generation.call({
      model: model,
      messages: messages,
      apiKey: API_KEY,
      stream: true, 
    });

    let content = '';
    for await (const chunk of result) {
      const newContent = chunk.output?.choices?.[0]?.message?.content;
      if (newContent && newContent !== content) {
        const diff = newContent.substring(content.length);
        content = newContent;
        yield diff;
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorMsg = `ERROR: An unexpected error occurred while calling the AI model. Details: ${errorMessage}`;
    console.error('Error calling ModelScope Chat Stream API:', error);
    yield errorMsg;
  }
}
