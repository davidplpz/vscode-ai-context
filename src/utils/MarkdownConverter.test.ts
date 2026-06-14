import { describe, it, expect } from 'vitest';
import { markdownToHtml } from './MarkdownConverter';

describe('MarkdownConverter', () => {
  it('converts headers (h2, h3, h4)', () => {
    const html = markdownToHtml('## Title\n\n### Subtitle\n\n#### Small');
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<h3>Subtitle</h3>');
    expect(html).toContain('<h4>Small</h4>');
  });

  it('converts paragraphs', () => {
    const html = markdownToHtml('First paragraph.\n\nSecond paragraph.');
    expect(html).toContain('<p>First paragraph.</p>');
    expect(html).toContain('<p>Second paragraph.</p>');
  });

  it('converts fenced code blocks with language', () => {
    const html = markdownToHtml('```go\nfunc main() {}\n```');
    expect(html).toContain('<pre><code class="language-go">');
    expect(html).toContain('func main() {}');
    expect(html).toContain('</code></pre>');
  });

  it('converts code blocks without language', () => {
    const html = markdownToHtml('```\nplain code\n```');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('plain code');
  });

  it('converts inline code', () => {
    const html = markdownToHtml('Use the `Save()` method.');
    expect(html).toContain('<code>Save()</code>');
  });

  it('converts bold text', () => {
    const html = markdownToHtml('This is **important**.');
    expect(html).toContain('<strong>important</strong>');
  });

  it('converts unordered lists', () => {
    const html = markdownToHtml('- First item\n- Second item\n- Third item');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>First item</li>');
    expect(html).toContain('<li>Second item</li>');
    expect(html).toContain('<li>Third item</li>');
    expect(html).toContain('</ul>');
  });

  it('converts tables', () => {
    const markdown = [
      '| Name   | Type |',
      '|--------|------|',
      '| input  | string |',
      '| count  | int |',
    ].join('\n');

    const html = markdownToHtml(markdown);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Name</th>');
    expect(html).toContain('<th>Type</th>');
    expect(html).toContain('<td>input</td>');
    expect(html).toContain('<td>string</td>');
    expect(html).toContain('<td>count</td>');
    expect(html).toContain('<td>int</td>');
    expect(html).toContain('</table>');
  });

  it('converts horizontal rules', () => {
    const html = markdownToHtml('before\n\n---\n\nafter');
    expect(html).toContain('<hr>');
  });

  it('converts links', () => {
    const html = markdownToHtml('See [docs](https://example.com)');
    expect(html).toContain('<a href="https://example.com">docs</a>');
  });

  it('escapes HTML in regular text', () => {
    const html = markdownToHtml('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('converts images', () => {
    const html = markdownToHtml('![alt](img.png)');
    expect(html).toContain('<img src="img.png" alt="alt" />');
  });

  it('handles mixed content from a real skill', () => {
    const realMarkdown = [
      '## Critical Patterns',
      '',
      '### Pattern 1: Table-Driven Tests',
      '',
      'Standard Go pattern:',
      '',
      '```go',
      'func TestFoo(t *testing.T) {',
      '    result := Foo()',
      '}',
      '```',
      '',
      '## Decision Tree',
      '',
      '```',
      'Testing a function?',
      '├── Pure function? → Table-driven',
      '```',
      '',
      '| Flag | Description |',
      '|------|-------------|',
      '| `-v` | Verbose |',
      '| `-run` | Filter |',
      '',
      '---',
      '',
      'See [testing docs](https://go.dev/doc).',
    ].join('\n');

    const html = markdownToHtml(realMarkdown);
    expect(html).toContain('<h2>Critical Patterns</h2>');
    expect(html).toContain('<h3>Pattern 1: Table-Driven Tests</h3>');
    expect(html).toContain('<code class="language-go">');
    // No <ul> here — the ├── lines are inside a code block, not markdown lists
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Flag</th>');
    expect(html).toContain('<th>Description</th>');
    expect(html).toContain('<td><code>-v</code></td>');
    expect(html).toContain('<hr>');
    expect(html).toContain('<a href="https://go.dev/doc">testing docs</a>');
  });

  it('preserves code content verbatim (no HTML escaping inside code blocks)', () => {
    const html = markdownToHtml('```\n<a href="test">\n```');
    expect(html).toContain('&lt;a href=&quot;test&quot;&gt;');
    // Inside code blocks, HTML is escaped for safety
    expect(html).not.toContain('<a href=');
  });
});
