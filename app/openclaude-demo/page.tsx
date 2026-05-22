'use client';

import { useState } from 'react';
import { generateCodeWithOpenClaude } from '@/lib/ai/openclaude-client';

export default function OpenClaudeExamplePage() {
  const [prompt, setPrompt] = useState('Create a React component that displays a hero section with a gradient background and a call-to-action button');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    setStatus('Initializing OpenClaude...');

    const response = await generateCodeWithOpenClaude(prompt, {
      stream: true,
      onStatus: setStatus,
      onStream: (chunk) => {
        setResult((prev) => prev + chunk);
      },
    });

    if (!response.success) {
      setStatus(`Error: ${response.error}`);
    } else {
      setStatus('Generation complete');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">OpenClaude Code Generator</h1>
          <p className="text-gray-400">Generate code using your local OpenClaude model</p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold">Your Request</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded p-4 text-white focus:border-blue-500 focus:outline-none"
            placeholder="Describe the code you want to generate..."
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition"
          >
            {loading ? 'Generating...' : 'Generate with OpenClaude'}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="text-sm text-gray-400">
            Status: {status}
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="space-y-4">
            <label className="block text-lg font-semibold">Generated Code</label>
            <pre className="bg-gray-900 border border-gray-700 rounded p-4 overflow-auto max-h-96 text-sm">
              <code>{result}</code>
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert('Copied to clipboard!');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition"
            >
              Copy Code
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-gray-900 border border-gray-700 rounded p-4">
          <h2 className="font-semibold mb-2">Configuration</h2>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>
              Endpoint: <code className="bg-black px-1 rounded">{process.env.NEXT_PUBLIC_OPENCLAUDE_ENDPOINT || 'http://localhost:8080/generate'}</code>
            </li>
            <li>
              Make sure your local OpenClaude server is running before using this.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
