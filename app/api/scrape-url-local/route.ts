import { NextRequest, NextResponse } from 'next/server';
import { parse, HTMLElement, TextNode, Node } from 'node-html-parser';

function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function extractMeta(root: HTMLElement, key: string): string {
  const node = root.querySelector(`meta[name="${key}"]`) || root.querySelector(`meta[property="${key}"]`);
  return node?.getAttribute('content')?.trim() ?? '';
}

function extractTitle(html: string): string {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match?.[1]?.trim() ?? '';
}

function findMainContent(root: HTMLElement): HTMLElement | null {
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '#main',
    '.main',
    'body'
  ];

  for (const selector of selectors) {
    const node = root.querySelector(selector);
    if (node && node.text.trim().length > 120) {
      return node;
    }
  }

  return root.querySelector('body') || root;
}

function nodeToMarkdown(node: Node): string {
  if (node instanceof TextNode) {
    return sanitizeText(node.text);
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  const tag = node.tagName.toLowerCase();
  const children = node.childNodes.map(nodeToMarkdown).filter(Boolean).join(' ');
  const text = sanitizeText(children);

  if (!text) {
    return '';
  }

  switch (tag) {
    case 'h1': return `\n# ${text}\n`;
    case 'h2': return `\n## ${text}\n`;
    case 'h3': return `\n### ${text}\n`;
    case 'h4': return `\n#### ${text}\n`;
    case 'h5': return `\n##### ${text}\n`;
    case 'h6': return `\n###### ${text}\n`;
    case 'p': return `\n${text}\n`;
    case 'li': return `\n- ${text}`;
    case 'ul':
    case 'ol': return `\n${text}\n`;
    case 'a': {
      const href = node.getAttribute('href')?.trim();
      return href ? `${text} (${href})` : text;
    }
    case 'strong':
    case 'b': return `**${text}**`;
    case 'em':
    case 'i': return `*${text}*`;
    case 'code': return `\`${text}\``;
    case 'pre': return `\n\n\`\`\`\n${text}\n\`\`\`\n`;
    case 'img': {
      const alt = node.getAttribute('alt')?.trim() || 'image';
      const src = node.getAttribute('src')?.trim() || '';
      return src ? `![${alt}](${src})` : '';
    }
    default: return text;
  }
}

function buildMarkdown(root: HTMLElement): string {
  const contentNode = findMainContent(root) || root;
  const markdown = nodeToMarkdown(contentNode).trim();
  return markdown || sanitizeText(root.textContent || '');
}

function buildText(root: HTMLElement): string {
  const contentNode = findMainContent(root) || root;
  const rawText = contentNode.textContent || root.textContent || '';
  return sanitizeText(rawText);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'OpenLovable Local Scraper/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { success: false, error: `Failed to fetch URL: ${response.status}`, body },
        { status: response.status }
      );
    }

    const html = await response.text();
    const root = parse(html);

    const title = extractMeta(root, 'og:title') || extractMeta(root, 'twitter:title') || extractTitle(html) || url;
    const description = extractMeta(root, 'description') || extractMeta(root, 'og:description') || extractMeta(root, 'twitter:description');
    const markdown = buildMarkdown(root);
    const text = buildText(root);

    const content = `Title: ${title}\nURL: ${url}\nDescription: ${description}\n\nExtracted Content:\n${markdown || text}`;

    return NextResponse.json({
      success: true,
      url,
      title,
      description,
      html,
      markdown,
      text,
      content,
      metadata: {
        scrapedAt: new Date().toISOString(),
        source: 'local-powerful',
        wordCount: text.split(/\s+/).filter(Boolean).length,
        titleLength: title.length,
        descriptionLength: description.length
      }
    });
  } catch (error) {
    console.error('[scrape-url-local] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
