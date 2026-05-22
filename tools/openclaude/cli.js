#!/usr/bin/env node
import fs from 'fs/promises';
import { argv, env } from 'process';
import { execSync } from 'child_process';

async function gitCommit(file, message) {
  try {
    execSync(`git add "${file}"`, { stdio: 'pipe' });
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
    console.log(`✓ Git commit: ${message}`);
  } catch (e) {
    console.warn(`⚠ Git commit failed (not in a repo or nothing to commit). Proceeding anyway...`);
  }
}

async function gitUndo() {
  try {
    execSync('git revert HEAD --no-edit', { stdio: 'pipe' });
    console.log('✓ Undone last OpenClaude edit via git revert');
  } catch (e) {
    console.error('✗ Git revert failed:', e.message);
    process.exit(1);
  }
}

async function main() {
  const args = argv.slice(2);
  
  // Handle --undo flag
  if (args.includes('--undo')) {
    await gitUndo();
    return;
  }

  if (args.length === 0) {
    console.error('Usage: openclaude/cli.js <file> [--instruction "..."] [--auth-token TOKEN]');
    console.error('       openclaude/cli.js --undo');
    process.exit(2);
  }

  const file = args[0];
  let instruction = '';
  let authToken = env.OPENCLAUDE_AUTH_TOKEN || '';

  const idx = args.indexOf('--instruction');
  if (idx !== -1 && args.length > idx + 1) instruction = args[idx + 1];

  const authIdx = args.indexOf('--auth-token');
  if (authIdx !== -1 && args.length > authIdx + 1) authToken = args[authIdx + 1];

  const endpoint = env.OPENCLAUDE_ENDPOINT || 'http://localhost:8080/generate';

  const text = await fs.readFile(file, 'utf8');

  const prompt = `${instruction}\n\nFile path: ${file}\n\nContents:\n${text}`;

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    console.error(`✗ HTTP ${res.status}:`, await res.text());
    process.exit(1);
  }

  const raw = await res.text();
  let resultText = raw;
  try {
    const j = JSON.parse(raw);
    resultText = j.text ?? j.result ?? raw;
  } catch (e) {
    // ignore
  }

  // Git commit before overwriting (for undo support)
  await gitCommit(file, `[OpenClaude] Before edit: ${file}`);

  // Write result
  await fs.writeFile(file, resultText, 'utf8');
  console.log('✓ Applied OpenClaude edits to', file);
  console.log('  Run "npm run openclaude:apply -- --undo" to revert.');
}

main().catch(err => {
  console.error('✗ OpenClaude CLI error:', err.message);
  process.exit(1);
});
