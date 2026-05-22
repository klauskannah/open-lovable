# OpenClaude VS Code integration (local)

Simple VS Code extension that sends the active file to a local OpenClaude HTTP endpoint and replaces the file with the returned content.

## Configuration

Settings (use workspace settings via `.vscode/settings.json` or user settings):

- `openclaude.endpoint` (string) — full URL to your local OpenClaude generate API (default: `http://localhost:8080/generate`)
- `openclaude.instruction` (string) — instruction/preprompt sent to the model before the file contents
- `openclaude.authToken` (string) — optional Bearer token for authentication (or use `OPENCLAUDE_AUTH_TOKEN` env var)

Example `.vscode/settings.json`:
```json
{
  "openclaude.endpoint": "http://localhost:8080/generate",
  "openclaude.instruction": "You are an expert code assistant. Fix bugs and improve this code.",
  "openclaude.authToken": "your-bearer-token-here"
}
```

## Installation & Usage

1. From workspace root:
```bash
cd extensions/openclaude-vscode
npm install
npm run compile
```

2. Press F5 in VS Code to run the extension in an Extension Development Host.

3. Open a file, then run the command **OpenClaude: Suggest Edits** from the Command Palette (Ctrl+Shift+P / Cmd+Shift+P).

4. The extension reads from workspace settings and sends the file to your OpenClaude endpoint.

## Authentication

The extension supports Bearer token authentication via:
- Workspace setting: `openclaude.authToken`
- Environment variable: `OPENCLAUDE_AUTH_TOKEN`

Token is sent as: `Authorization: Bearer TOKEN`

## Server Contract

The extension expects your local OpenClaude server to:
1. Accept POST JSON: `{ "prompt": "..." }`
2. Return either:
   - Raw text (treated as the new file content)
   - JSON with `text` or `result` field: `{ "text": "..." }`

Adapt `src/extension.ts` if your server uses a different contract.

## Packaging

To build a .vsix package:
```bash
npm run vscode:prepublish
npm run package
```
