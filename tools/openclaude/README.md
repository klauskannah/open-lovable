# OpenClaude CLI

Simple command-line tool to send file contents to a local OpenClaude HTTP endpoint and apply edits.

## Usage

```bash
# Apply edits to a file
npm run openclaude:apply -- path/to/file.js

# With custom instruction
npm run openclaude:apply -- path/to/file.js --instruction "Fix bugs and improve performance."

# With authentication
npm run openclaude:apply -- path/to/file.js --auth-token "your-token"

# Undo the last edit (git revert)
npm run openclaude:apply -- --undo
```

## Environment Variables

- `OPENCLAUDE_ENDPOINT` — Full URL to your local OpenClaude server (default: `http://localhost:8080/generate`)
- `OPENCLAUDE_AUTH_TOKEN` — Bearer token for authentication (optional)

Example:
```bash
OPENCLAUDE_ENDPOINT=http://localhost:8080/generate npm run openclaude:apply -- src/page.tsx
```

## Git-Backed Undo

Before applying edits, the tool automatically commits the current file to git (if in a repo). This allows you to easily revert:

```bash
npm run openclaude:apply -- --undo
```

This runs `git revert HEAD` to undo the last OpenClaude edit.

## Authentication

Pass a Bearer token via:
1. Command line: `--auth-token "TOKEN"`
2. Environment variable: `OPENCLAUDE_AUTH_TOKEN`

The token is sent as:
```
Authorization: Bearer TOKEN
```

## Server Contract

The tool expects your OpenClaude endpoint to:
1. Accept POST JSON: `{ "prompt": "..." }`
2. Return either:
   - Raw text (treated as the new file content)
   - JSON with `text` or `result` field: `{ "text": "..." }` or `{ "result": "..." }`
