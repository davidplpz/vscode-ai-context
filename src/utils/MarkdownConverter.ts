/**
 * Simple markdown → HTML converter for SKILL.md content.
 *
 * Handles the subset of markdown used in skill files:
 * - ATX headers (##, ###, ####)
 * - Fenced code blocks with language (```go, ```bash)
 * - Inline code (`code`)
 * - Bold (**text**)
 * - Unordered lists (- item)
 * - Tables (| col | col |)
 * - Horizontal rules (---)
 * - Links [text](url)
 * - Paragraphs
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Normalize line endings
  html = html.replace(/\r\n/g, '\n');

  // Split into blocks for processing
  const blocks = splitBlocks(html);
  const processed = blocks.map(processBlock).join('\n');

  // Wrap in a container
  return `<div class="skill-body">\n${processed}\n</div>`;
}

// ---------------------------------------------------------------------------
// Block-level processing
// ---------------------------------------------------------------------------

type Block =
  | { type: 'code'; lang: string; content: string }
  | { type: 'table'; content: string }
  | { type: 'hr' }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; content: string };

function splitBlocks(text: string): string[] {
  // Split by double newlines (paragraph breaks)
  // But preserve code blocks and lists
  const blocks: string[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(`__CODE__${lang}__${codeLines.join('\n')}__ENDCODE__`);
      continue;
    }

    // Horizontal rule
    if (/^-{3,}\s*$/.test(line)) {
      blocks.push('__HR__');
      i++;
      continue;
    }

    // Table row
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(`__TABLE__${tableLines.join('\n')}__ENDTABLE__`);
      continue;
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* ') || lines[i].trim() === '' || lines[i].startsWith('  '))) {
        if (lines[i].startsWith('- ') || lines[i].startsWith('* ')) {
          listLines.push(lines[i]);
        }
        i++;
      }
      blocks.push(`__LIST__${listLines.join('\n')}__ENDLIST__`);
      continue;
    }

    // Empty line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph — collect until next blank line or block element
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === '' || l.startsWith('```') || l.startsWith('|') || l.startsWith('- ') || l.startsWith('* ') || /^-{3,}\s*$/.test(l)) {
        break;
      }
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(`__PARA__${paraLines.join('\n')}__ENDPARA__`);
    }
  }

  return blocks;
}

function processBlock(block: string): string {
  if (block.startsWith('__CODE__')) {
    const match = block.match(/^__CODE__(.*?)__(.*)__ENDCODE__$/s);
    if (!match) return '';
    const lang = match[1] || '';
    const code = escapeHtml(match[2]);
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${langClass}>${code}</code></pre>`;
  }

  if (block === '__HR__') {
    return '<hr>';
  }

  if (block.startsWith('__TABLE__')) {
    const match = block.match(/^__TABLE__(.*)__ENDTABLE__$/s);
    if (!match) return '';
    return processTable(match[1]);
  }

  if (block.startsWith('__LIST__')) {
    const match = block.match(/^__LIST__(.*)__ENDLIST__$/s);
    if (!match) return '';
    return processList(match[1]);
  }

  if (block.startsWith('__PARA__')) {
    const match = block.match(/^__PARA__(.*)__ENDPARA__$/s);
    if (!match) return '';
    return processParagraph(match[1]);
  }

  return '';
}

// ---------------------------------------------------------------------------
// Table processing
// ---------------------------------------------------------------------------

function processTable(text: string): string {
  const rows = text.split('\n').filter((l) => l.trim().startsWith('|'));
  if (rows.length < 2) return text;

  // Skip separator row (| --- | --- |)
  const dataRows = rows.filter((r) => !/^\|[\s-:]+\|$/.test(r));
  if (dataRows.length === 0) return text;

  const headerCells = parseTableRow(dataRows[0]);
  const bodyRows = dataRows.slice(1).map(parseTableRow);

  let html = '<table>\n<thead>\n<tr>';
  for (const cell of headerCells) {
    html += `<th>${inlineToHtml(cell)}</th>`;
  }
  html += '</tr>\n</thead>\n<tbody>\n';
  for (const row of bodyRows) {
    html += '<tr>';
    for (const cell of row) {
      html += `<td>${inlineToHtml(cell)}</td>`;
    }
    html += '</tr>\n';
  }
  html += '</tbody>\n</table>';

  return html;
}

function parseTableRow(row: string): string[] {
  return row
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

// ---------------------------------------------------------------------------
// List processing
// ---------------------------------------------------------------------------

function processList(text: string): string {
  const items = text
    .split('\n')
    .filter((l) => l.startsWith('- ') || l.startsWith('* '))
    .map((l) => l.replace(/^[-*]\s+/, ''));

  const lis = items.map((item) => `<li>${inlineToHtml(item)}</li>`).join('\n');
  return `<ul>\n${lis}\n</ul>`;
}

// ---------------------------------------------------------------------------
// Paragraph processing (includes header detection)
// ---------------------------------------------------------------------------

function processParagraph(text: string): string {
  const lines = text.split('\n').filter(Boolean);
  const parts: string[] = [];

  for (const line of lines) {
    // ATX headers
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = inlineToHtml(headerMatch[2]);
      parts.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    // Regular paragraph line
    parts.push(`<p>${inlineToHtml(line)}</p>`);
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Inline processing
// ---------------------------------------------------------------------------

function inlineToHtml(text: string): string {
  let html = escapeHtml(text);

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  return html;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
