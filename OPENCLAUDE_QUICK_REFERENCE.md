# OpenClaude Quick Reference

Three ways to use your local OpenClaude in open-lovable:

## 1. 🌐 API Endpoint

**URL:** `POST /api/generate-with-openclaude`

**Usage:**
```bash
curl -X POST http://localhost:3000/api/generate-with-openclaude \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a React button component"}'
```

**Streaming:**
```javascript
const response = await fetch('/api/generate-with-openclaude', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Create a hero component', stream: true })
});
// Returns Server-Sent Events stream
```

**Client Library:**
```typescript
import { generateCodeWithOpenClaude } from '@/lib/ai/openclaude-client';

const result = await generateCodeWithOpenClaude(
  'Create a card component',
  { stream: true, onStream: (chunk) => console.log(chunk) }
);
```

---

## 2. 💻 CLI Tool

**Command:**
```bash
npm run openclaude:apply -- <file> [options]
```

**Examples:**
```bash
# Apply to a file
npm run openclaude:apply -- src/Button.tsx

# With custom instruction
npm run openclaude:apply -- src/Button.tsx \
  --instruction "Add dark mode support"

# With authentication
npm run openclaude:apply -- src/Button.tsx \
  --auth-token "your-token"

# Undo last change (git revert)
npm run openclaude:apply -- --undo
```

**Environment Variables:**
```bash
OPENCLAUDE_ENDPOINT=http://localhost:8080/generate
OPENCLAUDE_AUTH_TOKEN=your-token
```

---

## 3. 📝 VS Code Extension

**Setup:**
```bash
cd extensions/openclaude-vscode
npm install
npm run compile
```

**Run:** Press F5 in VS Code

**Usage:** 
- Open a file
- Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
- Run "OpenClaude: Suggest Edits"

**Configuration** (`.vscode/settings.json`):
```json
{
  "openclaude.endpoint": "http://localhost:8080/generate",
  "openclaude.instruction": "Generate clean code...",
  "openclaude.authToken": "optional-token"
}
```

---

## Configuration

Add to `.env.local`:
```bash
OPENCLAUDE_ENDPOINT=http://localhost:8080/generate
OPENCLAUDE_AUTH_TOKEN=your-token-here
```

---

## Full Workflow: Clone Website → Code

```bash
# 1. Start OpenClaude
python -m openclaude serve --port 8080

# 2. Start Next.js
npm run dev

# 3. Scrape website
# Visit http://localhost:3000 and use the scraper

# 4. Generate code (3 options):

# Option A: Use demo page
# Visit http://localhost:3000/openclaude-demo
# Paste scraped content → Generate code

# Option B: Use API directly
curl -X POST http://localhost:3000/api/generate-with-openclaude \
  -d '{"prompt": "Create component from..."}'

# Option C: Use client library in your code
const result = await generateCodeWithOpenClaude(prompt);

# 5. Refine with CLI
npm run openclaude:apply -- src/Component.tsx \
  --instruction "Add dark mode"

# Or refine in VS Code
# Press F5 → Open file → Cmd+Shift+P → "OpenClaude: Suggest Edits"

# 6. Undo if needed
npm run openclaude:apply -- --undo

# 7. Commit changes
git add .
git commit -m "Add new component"
```

---

## Common Commands

```bash
# Generate code via API
curl -X POST http://localhost:3000/api/generate-with-openclaude \
  -H "Content-Type: application/json" \
  -d '{"prompt":"your-request"}'

# Refine file via CLI
npm run openclaude:apply -- path/to/file

# Undo last CLI change
npm run openclaude:apply -- --undo

# Use in React component
import { generateCodeWithOpenClaude } from '@/lib/ai/openclaude-client';
const result = await generateCodeWithOpenClaude(userPrompt);

# Stream chunks as they arrive
await generateCodeWithOpenClaude(prompt, {
  stream: true,
  onStream: (chunk) => appendToEditor(chunk)
});
```

---

## Files & Docs

| File | Purpose |
|------|---------|
| `/api/generate-with-openclaude` | Main API endpoint |
| `/lib/ai/openclaude-client.ts` | Client library for easy integration |
| `/tools/openclaude/cli.js` | Command-line tool with git-backed undo |
| `/extensions/openclaude-vscode/` | VS Code extension |
| `.vscode/settings.json` | Workspace settings (endpoint, auth, instruction) |
| `docs/OPENCLAUDE_API.md` | Full API documentation |
| `docs/CLONE_AND_CODE_WORKFLOW.md` | Complete workflow guide |
| `OPENCLAUDE_INTEGRATION.md` | Integration overview |

---

## Troubleshooting

**Can't connect to OpenClaude?**
- Ensure server is running: `python -m openclaude serve --port 8080`
- Check `OPENCLAUDE_ENDPOINT` in `.env.local`

**CLI says "not in a repo"?**
- Initialize git: `git init && git add . && git commit -m "init"`

**VS Code extension not showing?**
- Run `npm install && npm run compile` in `extensions/openclaude-vscode/`
- Press F5 to open Extension Development Host

**Streaming returns empty?**
- Check OpenClaude server logs
- Verify prompt format is valid
- Try `stream: false` to debug

---

## Next Steps

1. Configure `.env.local` with your endpoint
2. Test: Visit `/openclaude-demo`
3. Scrape a website
4. Generate and refine code
5. Use CLI or VS Code for iteration

**Enjoy! 🚀**
