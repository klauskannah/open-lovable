/**
 * OpenClaude client library for calling the local model via the API endpoint.
 * Handles streaming and non-streaming requests.
 */

export interface OpenClaudeOptions {
  instruction?: string;
  stream?: boolean;
  context?: {
    currentFiles?: Record<string, string>;
    sandboxId?: string;
    [key: string]: any;
  };
  onStream?: (chunk: string) => void;
  onStatus?: (message: string) => void;
}

export interface OpenClaudeResponse {
  success: boolean;
  content?: string;
  error?: string;
  type?: string;
}

/**
 * Call OpenClaude via the local API endpoint.
 * Supports streaming for real-time progress.
 */
export async function generateWithOpenClaude(
  prompt: string,
  options: OpenClaudeOptions = {}
): Promise<OpenClaudeResponse> {
  const { instruction, stream = true, context, onStream, onStatus } = options;

  try {
    const response = await fetch('/api/generate-with-openclaude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        instruction,
        stream,
        context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
      };
    }

    if (stream && response.body) {
      // Handle streaming response
      return handleStreamingResponse(response, onStream, onStatus);
    } else {
      // Handle non-streaming response
      const data: OpenClaudeResponse = await response.json();
      return data;
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleStreamingResponse(
  response: Response,
  onStream?: (chunk: string) => void,
  onStatus?: (message: string) => void
): Promise<OpenClaudeResponse> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));

            if (json.type === 'status') {
              onStatus?.(json.message);
            } else if (json.type === 'stream') {
              fullContent += json.content || '';
              onStream?.(json.content || '');
            } else if (json.type === 'complete') {
              // Stream finished
            } else if (json.type === 'error') {
              return {
                success: false,
                error: json.message,
              };
            }
          } catch {
            // Ignore parse errors for keep-alive comments
          }
        }
      }
    }

    return {
      success: true,
      content: fullContent,
      type: 'text',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stream error',
    };
  }
}

/**
 * Convenience function for code generation with OpenClaude.
 * Pre-configured instruction for code generation.
 */
export async function generateCodeWithOpenClaude(
  userRequest: string,
  options: Omit<OpenClaudeOptions, 'instruction'> = {}
): Promise<OpenClaudeResponse> {
  const instruction = `You are an expert web developer. Generate clean, well-structured code that is production-ready. 
Return only the code, properly formatted, without any explanations or markdown code blocks.`;

  return generateWithOpenClaude(userRequest, {
    ...options,
    instruction,
  });
}
