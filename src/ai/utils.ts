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
      console.log('✅ Dashscope Generation module loaded successfully');
    } catch (e) {
      console.error('❌ Failed to import or find Generation in dashscope:', e);
      return null;
    }
  }
  return dashscopeGeneration;
}

// Default model configuration
const DEFAULT_MODEL = 'qwen-max';
const FALLBACK_MODEL = 'qwen-plus';
const MAX_PROMPT_LENGTH = 8000;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Calls the ModelScope API with a given prompt and model.
 * This is the primary model for deep analysis.
 * @param prompt The prompt to send to the model.
 * @param model The model to use (defaults to qwen-max).
 * @param retries Number of retry attempts on failure (default: 2)
 * @returns The model's response text.
 */
export const callModelScopeAI = async (
    prompt: string,
    model: string = process.env.MODELSCOPE_MODEL_1 || DEFAULT_MODEL,
    retries: number = 2
): Promise<string> => {
    const API_KEY = process.env.MODELSCOPE_API_KEY;

    // Check for API key
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        // In development, provide more helpful message
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ ModelScope API key not configured. Please add MODELSCOPE_API_KEY to your .env file.');
            return 'ERROR: ModelScope API key not configured. For development, please add your API key to the .env file.';
        }
        
        const errorMsg = 'ERROR: ModelScope API key not configured.';
        console.error(errorMsg);
        return errorMsg;
    }

    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
        return 'ERROR: Empty prompt provided to AI model.';
    }

    // Truncate extremely long prompts
    const truncatedPrompt = prompt.length > MAX_PROMPT_LENGTH 
        ? prompt.substring(0, MAX_PROMPT_LENGTH) + '... [truncated]' 
        : prompt;

    let lastError: Error | null = null;
    
    // Try with retries
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const Generation = await getDashscopeGeneration();
            if (!Generation) {
                throw new Error('Dashscope Generation module could not be loaded.');
            }

            // Log in development only
            if (process.env.NODE_ENV === 'development') {
                console.log(`🤖 AI Call [Attempt ${attempt}] - Model: ${model}`);
                console.log(`Prompt length: ${truncatedPrompt.length} chars`);
            }

            const result = await Generation.call({
                model: model,
                prompt: truncatedPrompt,
                apiKey: API_KEY,
                timeout: DEFAULT_TIMEOUT,
            });

            // Check for successful response
            if (result.statusCode === 200 && result.output?.text) {
                const responseText = result.output.text.trim();
                
                // Log success in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ AI Call successful - Response length: ${responseText.length} chars`);
                }
                
                return responseText;
            } else {
                // Handle specific error cases
                const statusCode = result.statusCode || 'unknown';
                const message = result.message || 'No message';
                const errorMsg = `ERROR: ModelScope API call failed with status ${statusCode}. Message: ${message}`;
                
                // Log detailed error
                console.error(`❌ AI Call failed (attempt ${attempt}):`, {
                    statusCode,
                    message,
                    model,
                    attempt
                });

                // If we have more retries, try again
                if (attempt <= retries) {
                    console.log(`🔄 Retrying... (attempt ${attempt + 1}/${retries + 1})`);
                    // Exponential backoff with jitter
                    const delay = 1000 * attempt * (1 + Math.random() * 0.5);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                return errorMsg;
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            const errorMessage = lastError.message;
            
            console.error(`❌ AI Call error (attempt ${attempt}):`, {
                error: errorMessage,
                model,
                attempt
            });

            // Check for rate limiting or quota errors
            if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                // Try fallback model if available
                if (model !== FALLBACK_MODEL) {
                    console.log(`🔄 Rate limited, trying fallback model: ${FALLBACK_MODEL}`);
                    return callModelScopeAI(prompt, FALLBACK_MODEL, 1);
                }
            }

            // If we have more retries, wait and try again
            if (attempt <= retries) {
                console.log(`🔄 Retrying... (attempt ${attempt + 1}/${retries + 1})`);
                // Exponential backoff with jitter
                const delay = 1000 * attempt * (1 + Math.random() * 0.5);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
        }
    }

    // All retries failed
    const errorMsg = `ERROR: All ${retries + 1} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`;
    console.error(errorMsg);
    return errorMsg;
};

/**
 * Check if the AI service is available
 * @returns Promise<boolean> indicating if AI service is available
 */
export const checkAIAvailability = async (): Promise<boolean> => {
    try {
        const testPrompt = 'Respond with "OK" if you are available.';
        const response = await callModelScopeAI(testPrompt, DEFAULT_MODEL, 0);
        
        // Check if response is an error or actual content
        if (response.startsWith('ERROR:')) {
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('AI availability check failed:', error);
        return false;
    }
};

/**
 * Get AI service status with details
 * @returns Promise with status object
 */
export const getAIStatus = async (): Promise<{
    available: boolean;
    configured: boolean;
    model: string;
    message: string;
}> => {
    const API_KEY = process.env.MODELSCOPE_API_KEY;
    const configured = !!(API_KEY && API_KEY !== 'YOUR_API_KEY_HERE');
    
    if (!configured) {
        return {
            available: false,
            configured: false,
            model: DEFAULT_MODEL,
            message: 'API key not configured'
        };
    }

    try {
        const available = await checkAIAvailability();
        return {
            available,
            configured: true,
            model: DEFAULT_MODEL,
            message: available ? 'AI service available' : 'AI service unavailable'
        };
    } catch (error) {
        return {
            available: false,
            configured: true,
            model: DEFAULT_MODEL,
            message: `Error checking status: ${error instanceof Error ? error.message : String(error)}`
        };
    }
};

// Optional: Export a simpler version for quick calls
export const callAI = async (prompt: string): Promise<string> => {
    return callModelScopeAI(prompt);
};