import { NextRequest, NextResponse } from 'next/server';

// Force dynamic route to enable streaming
export const dynamic = 'force-dynamic';

/**
 * POST /api/generate-with-openclaude
 * 
 * Calls your local OpenClaude instance for code generation.
 * 
 * Request body:
 * {
 *   prompt: string,
 *   context?: { currentFiles?: Record<string, string>, ... },
 *   instruction?: string,
 *   stream?: boolean (default: true)
 * }
 * 
 * Response: Server-sent events stream or JSON response
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, context, instruction, stream = true } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build the full prompt with context
    let fullPrompt = prompt;
    if (context?.currentFiles && Object.keys(context.currentFiles).length > 0) {
      const filesContext = Object.entries(context.currentFiles)
        .map(([path, content]) => `\n// File: ${path}\n${content}`)
        .join('\n\n');
      fullPrompt = `${prompt}\n\n## Current Project Files:\n${filesContext}`;
    }

    const systemInstruction = instruction || 'You are an expert code assistant. Generate clean, well-structured code.';
    const fullRequest = `${systemInstruction}\n\n${fullPrompt}`;

    // Get OpenClaude endpoint and auth from env
    const endpoint = process.env.OPENCLAUDE_ENDPOINT || 'http://localhost:8080/generate';
    const authToken = process.env.OPENCLAUDE_AUTH_TOKEN || '';

    console.log('[generate-with-openclaude] Calling:', endpoint);
    console.log('[generate-with-openclaude] Prompt length:', fullRequest.length);

    // Call local OpenClaude
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: fullRequest }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-with-openclaude] OpenClaude error:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `OpenClaude returned ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    // If streaming is requested, stream the response
    if (stream && response.body) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'OpenClaude generating...' })}\n\n`));

          try {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              if (buffer.length > 0) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stream', content: buffer })}\n\n`));
                buffer = '';
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
          } catch (error) {
            console.error('[generate-with-openclaude] Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(error) })}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Non-streaming response
    const responseText = await response.text();
    let resultText = responseText;

    // Try to parse JSON response (in case OpenClaude returns {text: "..."})
    try {
      const json = JSON.parse(responseText);
      resultText = json.text ?? json.result ?? json.content ?? responseText;
    } catch {
      // Not JSON, use as-is
    }

    return NextResponse.json({
      success: true,
      content: resultText,
      type: 'text',
    });
  } catch (error) {
    console.error('[generate-with-openclaude] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
