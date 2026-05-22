# OpenClaude API Integration

This guide explains how to use your local OpenClaude model for code generation in the open-lovable app.

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Local OpenClaude endpoint
OPENCLAUDE_ENDPOINT=http://localhost:8080/generate

# Optional: Bearer token for authentication
OPENCLAUDE_AUTH_TOKEN=your-token-here
```

### 2. Start Your OpenClaude Server

Make sure your local OpenClaude instance is running:

```bash
# In your OpenClaude terminal
python -m openclaude serve --port 8080
```

### 3. Test the Integration

Visit: `http://localhost:3000/openclaude-demo`

This page provides an interactive UI to test code generation with your local model.

## API Endpoint

### POST `/api/generate-with-openclaude`

Generate code using your local OpenClaude instance.

**Request Body:**
```json
{
  "prompt": "Create a React button component",
  "instruction": "You are an expert code assistant. Generate clean code.",
  "stream": true,
  "context": {
    "currentFiles": {
      "src/Button.tsx": "export function Button() { ... }"
    }
  }
}
```

**Parameters:**
- `prompt` (required) — Your code generation request
- `instruction` (optional) — System instruction for the model
- `stream` (optional, default: true) — Return streaming response (Server-Sent Events)
- `context` (optional) — Project context, including current files

**Response (Streaming):**
```
data: {"type":"status","message":"OpenClaude generating..."}
data: {"type":"stream","content":"export function Button() {"}
data: {"type":"stream","content":"\n  return <button>Click me</button>"}
data: {"type":"complete"}
```

**Response (Non-Streaming JSON):**
```json
{
  "success": true,
  "content": "export function Button() {\n  return <button>Click me</button>\n}",
  "type": "text"
}
```

## Client Library

Use the `generateWithOpenClaude` function for easy integration:

```typescript
import { generateWithOpenClaude } from '@/lib/ai/openclaude-client';

// Streaming example
const response = await generateWithOpenClaude('Create a hero component', {
  stream: true,
  onStatus: (status) => console.log('Status:', status),
  onStream: (chunk) => console.log('Chunk:', chunk),
  context: {
    currentFiles: {
      'src/Hero.tsx': existingCode
    }
  }
});

if (response.success) {
  console.log(response.content);
}
```

## Code Generation Helper

For optimized code generation, use the code-specific helper:

```typescript
import { generateCodeWithOpenClaude } from '@/lib/ai/openclaude-client';

const response = await generateCodeWithOpenClaude(
  'Create a TypeScript utility function for debouncing',
  {
    stream: true,
    onStream: (chunk) => setResult(prev => prev + chunk)
  }
);
```

This helper automatically configures the instruction for clean, production-ready code.

## Integration with Existing Routes

You can mix OpenClaude with other AI providers:

```typescript
// Use OpenClaude for code generation
const codeResponse = await fetch('/api/generate-with-openclaude', { ... });

// Use Claude, GPT, etc. for analysis
const analysisResponse = await fetch('/api/generate-ai-code-stream', { ... });
```

## Server Configuration

Your OpenClaude server must:

1. **Accept POST requests** with JSON body: `{ "prompt": "..." }`
2. **Return responses** as:
   - Raw text (treated as the generated code)
   - JSON: `{ "text": "..." }` or `{ "result": "..." }`
3. **Support authentication** (optional) via `Authorization: Bearer TOKEN` header

## Common Use Cases

### 1. Clone & Code a Website

```typescript
// Scrape website
const scrapedContent = await fetch('/api/scrape-url-local', { ... });

// Generate initial code
const generated = await generateCodeWithOpenClaude(
  `Create a component from this design:\n${scrapedContent}`,
  { stream: true }
);

// Refine with OpenClaude (CLI or VS Code)
// npm run openclaude:apply -- src/Component.tsx --instruction "Add animations"
```

### 2. Real-Time Code Refinement

```typescript
// User edits code
const userFeedback = "Add dark mode support";

// Stream refinements
await generateCodeWithOpenClaude(`${currentCode}\n\n${userFeedback}`, {
  stream: true,
  onStream: (chunk) => updateEditor(chunk)
});
```

### 3. Batch Processing Files

```bash
# Apply OpenClaude to multiple files
npm run openclaude:apply -- src/components/Button.tsx --instruction "Add TypeScript types"
npm run openclaude:apply -- src/components/Card.tsx --instruction "Improve accessibility"

# Undo if needed
npm run openclaude:apply -- --undo
```

## Troubleshooting

### Connection Refused
- Ensure OpenClaude server is running on the configured endpoint
- Check `OPENCLAUDE_ENDPOINT` in `.env.local`

### 401 Unauthorized
- Verify `OPENCLAUDE_AUTH_TOKEN` if your server requires authentication
- Check token format (should be Bearer token compatible)

### Streaming Not Working
- Verify your OpenClaude server supports streaming
- Set `stream: false` to fall back to non-streaming mode

### Rate Limiting
- OpenClaude servers may have rate limits
- Implement retry logic or caching for production use

## Performance Tips

1. **Streaming for large responses** — reduces perceived latency
2. **Batch similar requests** — more efficient for local inference
3. **Use context wisely** — include only relevant file context
4. **Cache results** — avoid regenerating identical requests
5. **Monitor endpoint health** — add health checks before generating

## Next Steps

- Test the demo page: `/openclaude-demo`
- Integrate into your code generation flow
- Customize the `instruction` prompt for your use cases
- Consider adding caching or retry logic for robustness
