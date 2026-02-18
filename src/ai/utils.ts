'use server';
/**
 * @fileOverview AI model utility functions for calling ModelScope.
 */

// Lazily import dashscope to improve initial load time and avoid server-side import issues.
let dashscopeGeneration: any;
async function getDashscopeGeneration() {
  if (!dashscopeGeneration) {
    try {
      const { Generation } = await import('dashscope');
      dashscopeGeneration = Generation;
    } catch (e) {
      console.error('Failed to import or find Generation in dashscope', e);
      return null;
    }
  }
  return dashscopeGeneration;
}

/**
 * Calls the ModelScope API with a given prompt and model.
 * This is the primary model for deep analysis.
 * @param prompt The prompt to send to the model.
 * @param model The model to use (defaults to qwen-max).
 * @returns The model's response text.
 */
export const callModelScopeAI = async (
    prompt: string,
    model: string = process.env.MODELSCOPE_MODEL_1 || 'qwen-max'
): Promise<string> => {
    const API_KEY = process.env.MODELSCOPE_API_KEY;

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        const errorMsg = 'ERROR: ModelScope API key not configured.';
        console.error(errorMsg);
        return errorMsg;
    }

    try {
        const Generation = await getDashscopeGeneration();
        if (!Generation) {
            throw new Error('Dashscope Generation module could not be loaded.');
        }

        const result = await Generation.call({
            model: model,
            prompt: prompt,
            apiKey: API_KEY,
        });

        if (result.statusCode === 200 && result.output && result.output.text) {
            return result.output.text;
        } else {
            const errorMsg = `ERROR: ModelScope API call failed with status ${result.statusCode || 'unknown'}. Message: ${result.message || 'No message'}`;
            console.error(errorMsg, result);
            return errorMsg;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorMsg = `ERROR: An unexpected error occurred while calling the AI model. Details: ${errorMessage}`;
        console.error(errorMsg);
        return errorMsg;
    }
};
