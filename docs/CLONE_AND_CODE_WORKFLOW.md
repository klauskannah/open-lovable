# Clone & Code Websites with OpenClaude

Complete workflow for scraping websites, generating code, and refining it with your local OpenClaude model.

## Prerequisites

1. **Local OpenClaude running:**
   ```bash
   python -m openclaude serve --port 8080
   ```

2. **Environment configured** in `.env.local`:
   ```bash
   # Optional: Firecrawl only if you want the paid enhanced scraper
   # FIRECRAWL_API_KEY=your_key
   OPENCLAUDE_ENDPOINT=http://localhost:8080/generate
   ```

3. **Next.js dev server running:**
   ```bash
   npm run dev
   ```

## Workflow: Clone Website → Code with OpenClaude

### Step 1: Scrape the Website

This repo now includes a free local scraper that does not require a Firecrawl key.

Use the local scraper endpoint for powerful HTML extraction without a Firecrawl key:

```typescript
POST /api/scrape-url-local
```

If you have a Firecrawl key and want even richer dynamic scraping, the existing endpoints still work:

```typescript
POST /api/scrape-website
POST /api/scrape-url-enhanced
POST /api/extract-brand-styles
```

Or use the CLI from within the app.

### Step 2: Generate Initial Code with OpenClaude

Use the new OpenClaude API endpoint to generate code:

```bash
# Via the demo page
http://localhost:3000/openclaude-demo

# Via API directly
curl -X POST http://localhost:3000/api/generate-with-openclaude \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a React component based on this website design: [scraped content]",
    "instruction": "Generate clean, production-ready code with proper TypeScript types"
  }'
```

### Step 3: Apply Generated Code to Your Project

The generated code is returned in the response. Save it to your project:

```typescript
// Example: save to src/components/Homepage.tsx
const response = await fetch('/api/generate-with-openclaude', {
  method: 'POST',
  body: JSON.stringify({
    prompt: `Create a component from:\n${scrapedHTML}`,
  })
});

const { content } = await response.json();
fs.writeFileSync('src/components/Homepage.tsx', content);
```

### Step 4: Preview & Test

Run the dev server and preview the generated component:

```bash
npm run dev
# Visit http://localhost:3000 to see your generated code live
```

### Step 5: Refine with OpenClaude (Option A: CLI)

Use the command-line tool to apply edits:

```bash
# Refine the component with specific instructions
npm run openclaude:apply -- src/components/Homepage.tsx \
  --instruction "Add dark mode support, improve animations, fix accessibility issues"

# Or with environment variable
OPENCLAUDE_ENDPOINT=http://localhost:8080/generate npm run openclaude:apply -- src/components/Homepage.tsx

# If unhappy with changes, undo (git revert)
npm run openclaude:apply -- --undo
```

### Step 5: Refine with OpenClaude (Option B: VS Code)

Or use the VS Code extension for in-editor refinement:

1. Install the extension:
   ```bash
   cd extensions/openclaude-vscode
   npm install && npm run compile
   ```

2. Press F5 to run in Extension Development Host

3. Open a code file and run **OpenClaude: Suggest Edits** from Command Palette

4. The file is replaced with refined code in place

### Step 6: Iterate

Keep refining until the component matches your requirements:

```bash
# Multiple iterations
npm run openclaude:apply -- src/components/Homepage.tsx --instruction "Add loading state animation"
npm run openclaude:apply -- src/components/Homepage.tsx --instruction "Optimize performance with React.memo"
npm run openclaude:apply -- src/components/Homepage.tsx --instruction "Add unit tests"

# Undo any step if needed
npm run openclaude:apply -- --undo
```

## Complete Example

### 1. Start services

```bash
# Terminal 1: Start OpenClaude
python -m openclaude serve --port 8080

# Terminal 2: Start Next.js
npm run dev
```

### 2. Scrape and generate

Visit `http://localhost:3000/openclaude-demo`:

```
Prompt: "Create a beautiful hero component with gradient background based on this design..."
[Paste scraped website HTML]
```

Get generated code.

### 3. Save and refine

```bash
# Save to project
mkdir -p src/components
echo '[generated code]' > src/components/HeroSection.tsx

# Refine in VS Code
# Open file → Cmd+Shift+P → "OpenClaude: Suggest Edits"
# Or via CLI:
npm run openclaude:apply -- src/components/HeroSection.tsx \
  --instruction "Add responsive design for mobile, tablet, desktop"
```

### 4. Continue building

```bash
# Generate other components
npm run openclaude:apply -- src/components/Navbar.tsx --instruction "..."
npm run openclaude:apply -- src/components/Footer.tsx --instruction "..."

# Stack them in your page
```

## Integration with Existing Code

Combine with other AI models as needed:

```typescript
// OpenClaude for initial generation
const initial = await generateCodeWithOpenClaude(requirements);

// Claude for refinement/analysis
const analysis = await streamText({
  model: anthropic('claude-3-5-sonnet'),
  prompt: `Review this code: ${initial.content}`
});

// OpenClaude again for final polish
const final = await generateCodeWithOpenClaude(
  `${initial.content}\n\nBased on this feedback: ${analysis}`
);
```

## Advanced: Batch Processing

Process multiple files with OpenClaude:

```bash
# Create a script: refine-components.sh
for file in src/components/*.tsx; do
  echo "Refining $file..."
  npm run openclaude:apply -- "$file" \
    --instruction "Improve TypeScript types, add error boundaries, optimize re-renders"
done

# Run it
chmod +x refine-components.sh
./refine-components.sh
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused` | Ensure OpenClaude server is running on port 8080 |
| `Empty response` | Check prompt format and OpenClaude server logs |
| `Git commit failed` | Initialize git: `git init && git add . && git commit -m "init"` |
| `VS Code extension not loading` | Run `npm install && npm run compile` in `extensions/openclaude-vscode/` |

## Performance Tips

- **Batch similar changes** — more efficient for local inference
- **Use streaming** — perceivably faster for large outputs
- **Provide context** — include relevant files to improve code quality
- **Specialize instructions** — "Add TypeScript" vs generic "improve"
- **Monitor logs** — check `OPENCLAUDE_ENDPOINT` response times

## Next Steps

1. ✅ Start OpenClaude server
2. ✅ Configure `.env.local`
3. ✅ Try the demo page (`/openclaude-demo`)
4. ✅ Scrape a website
5. ✅ Generate code
6. ✅ Refine with CLI or VS Code
7. ✅ Build your website component by component

**Happy coding! 🚀**
