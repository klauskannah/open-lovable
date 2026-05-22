import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

function postJson(urlStr: string, body: any, headers: any = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const data = JSON.stringify(body);
      const lib = url.protocol === 'https:' ? https : http;
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      };
      const options: any = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: defaultHeaders
      };
      const req = lib.request(options, (res: any) => {
        const chunks: any[] = [];
        res.on('data', (c: any) => chunks.push(c));
        res.on('end', () => {
          const s = Buffer.concat(chunks).toString();
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${s}`));
          } else {
            resolve(s);
          }
        });
      });
      req.on('error', (err: any) => reject(err));
      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('openclaude.suggestEdits', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('OpenClaude: open a file first');
      return;
    }

    const doc = editor.document;
    const text = doc.getText();

    const config = vscode.workspace.getConfiguration('openclaude');
    const endpoint = config.get<string>('endpoint') || 'http://localhost:8080/generate';
    const instruction = config.get<string>('instruction') || 'You are an expert code assistant. Return the full new file content as plain text.';
    const authToken = config.get<string>('authToken') || process.env.OPENCLAUDE_AUTH_TOKEN || '';

    const prompt = `${instruction}\n\nFile path: ${doc.uri.fsPath}\n\nContents:\n${text}`;

    const headers: any = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'OpenClaude: generating edits...' }, async () => {
      try {
        const raw = await postJson(endpoint, { prompt }, headers);
        let resultText = raw;
        try {
          const j = JSON.parse(raw);
          // common response shapes: {text: "..."} or {result: "..."}
          resultText = j.text ?? j.result ?? raw;
        } catch {
          // not JSON, treat as raw text
        }

        const fullRange = new vscode.Range(
          doc.positionAt(0),
          doc.positionAt(text.length)
        );

        await editor.edit(editBuilder => {
          editBuilder.replace(fullRange, resultText);
        });

        vscode.window.showInformationMessage('OpenClaude: applied edits');
      } catch (err: any) {
        vscode.window.showErrorMessage('OpenClaude: request failed: ' + String(err));
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
