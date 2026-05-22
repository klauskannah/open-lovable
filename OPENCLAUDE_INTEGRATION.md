# OpenClaude Integration Guide

Your local OpenClaude is now integrated into the open-lovable workspace with three usage methods:

## 1. **CLI Tool** (Recommended for scripting)

Apply edits via command line with git-backed undo:

```bash
# Apply edits to a file
npm run openclaude:apply -- path/to/file.tsx

# With custom instruction
npm run openclaude:apply -- src/page.tsx --instruction "Fix bugs and improve performance."

# With authentication
npm run openclaude:apply -- src/page.tsx --auth-token "your-token"

# Undo last edit (git revert)
npm run openclaude:apply -- --undo
```

See [tools/openclaude/README.md](tools/openclaude/README.md) for full docs.

## 2. **VS Code Extension** (Recommended for in-editor use)

In-editor command to apply OpenClaude edits directly from VS Code:

1. Set up the extension:
```bash
cd extensions/openclaude-vscode
npm install
npm run compile
```

2. Press **F5** to run in Extension Development Host, or install as a local extension.

3. Configure workspace settings (`.vscode/settings.json`):
```json
{
  "openclaude.endpoint": "http://localhost:8080/generate",
  "openclaude.instruction": "You are an expert code assistant.",
  "openclaude.authToken": "your-token-here"
}
```

4. Open a file and run **OpenClaude: Suggest Edits** from the Command Palette.

See [extensions/openclaude-vscode/README.md](extensions/openclaude-vscode/README.md) for full docs.

## 3. **Environment Variables**

Both CLI and extension respect:

- `OPENCLAUDE_ENDPOINT` — Server URL (default: `http://localhost:8080/generate`)
- `OPENCLAUDE_AUTH_TOKEN` — Bearer token for auth

## Undo & Safety

- **CLI**: Commits before editing → use `npm run openclaude:apply -- --undo` to revert
- **Extension**: Uses VS Code's native undo (Ctrl+Z / Cmd+Z)

## Configuration

All settings are defined in [.vscode/settings.json](.vscode/settings.json):

```json
{
  "openclaude.endpoint": "http://localhost:8080/generate",
  "openclaude.instruction": "...",
  "openclaude.authToken": ""
}
```

Override per-project or per-user as needed.

## Authentication

Both CLI and extension support Bearer token auth:

```bash
# CLI
npm run openclaude:apply -- file.tsx --auth-token "TOKEN"

# Or via env var
OPENCLAUDE_AUTH_TOKEN=TOKEN npm run openclaude:apply -- file.tsx
```

In the extension, use the `openclaude.authToken` setting or `OPENCLAUDE_AUTH_TOKEN` env var.

---

**Next steps**: Configure your local OpenClaude endpoint and start using!
