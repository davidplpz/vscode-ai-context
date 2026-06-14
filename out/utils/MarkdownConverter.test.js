"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const MarkdownConverter_1 = require("./MarkdownConverter");
(0, vitest_1.describe)('MarkdownConverter', () => {
    (0, vitest_1.it)('converts headers (h2, h3, h4)', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('## Title\n\n### Subtitle\n\n#### Small');
        (0, vitest_1.expect)(html).toContain('<h2>Title</h2>');
        (0, vitest_1.expect)(html).toContain('<h3>Subtitle</h3>');
        (0, vitest_1.expect)(html).toContain('<h4>Small</h4>');
    });
    (0, vitest_1.it)('converts paragraphs', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('First paragraph.\n\nSecond paragraph.');
        (0, vitest_1.expect)(html).toContain('<p>First paragraph.</p>');
        (0, vitest_1.expect)(html).toContain('<p>Second paragraph.</p>');
    });
    (0, vitest_1.it)('converts fenced code blocks with language', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('```go\nfunc main() {}\n```');
        (0, vitest_1.expect)(html).toContain('<pre><code class="language-go">');
        (0, vitest_1.expect)(html).toContain('func main() {}');
        (0, vitest_1.expect)(html).toContain('</code></pre>');
    });
    (0, vitest_1.it)('converts code blocks without language', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('```\nplain code\n```');
        (0, vitest_1.expect)(html).toContain('<pre><code>');
        (0, vitest_1.expect)(html).toContain('plain code');
    });
    (0, vitest_1.it)('converts inline code', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('Use the `Save()` method.');
        (0, vitest_1.expect)(html).toContain('<code>Save()</code>');
    });
    (0, vitest_1.it)('converts bold text', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('This is **important**.');
        (0, vitest_1.expect)(html).toContain('<strong>important</strong>');
    });
    (0, vitest_1.it)('converts unordered lists', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('- First item\n- Second item\n- Third item');
        (0, vitest_1.expect)(html).toContain('<ul>');
        (0, vitest_1.expect)(html).toContain('<li>First item</li>');
        (0, vitest_1.expect)(html).toContain('<li>Second item</li>');
        (0, vitest_1.expect)(html).toContain('<li>Third item</li>');
        (0, vitest_1.expect)(html).toContain('</ul>');
    });
    (0, vitest_1.it)('converts tables', () => {
        const markdown = [
            '| Name   | Type |',
            '|--------|------|',
            '| input  | string |',
            '| count  | int |',
        ].join('\n');
        const html = (0, MarkdownConverter_1.markdownToHtml)(markdown);
        (0, vitest_1.expect)(html).toContain('<table>');
        (0, vitest_1.expect)(html).toContain('<th>Name</th>');
        (0, vitest_1.expect)(html).toContain('<th>Type</th>');
        (0, vitest_1.expect)(html).toContain('<td>input</td>');
        (0, vitest_1.expect)(html).toContain('<td>string</td>');
        (0, vitest_1.expect)(html).toContain('<td>count</td>');
        (0, vitest_1.expect)(html).toContain('<td>int</td>');
        (0, vitest_1.expect)(html).toContain('</table>');
    });
    (0, vitest_1.it)('converts horizontal rules', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('before\n\n---\n\nafter');
        (0, vitest_1.expect)(html).toContain('<hr>');
    });
    (0, vitest_1.it)('converts links', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('See [docs](https://example.com)');
        (0, vitest_1.expect)(html).toContain('<a href="https://example.com">docs</a>');
    });
    (0, vitest_1.it)('escapes HTML in regular text', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('<script>alert("xss")</script>');
        (0, vitest_1.expect)(html).not.toContain('<script>');
        (0, vitest_1.expect)(html).toContain('&lt;script&gt;');
    });
    (0, vitest_1.it)('converts images', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('![alt](img.png)');
        (0, vitest_1.expect)(html).toContain('<img src="img.png" alt="alt" />');
    });
    (0, vitest_1.it)('handles mixed content from a real skill', () => {
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
        const html = (0, MarkdownConverter_1.markdownToHtml)(realMarkdown);
        (0, vitest_1.expect)(html).toContain('<h2>Critical Patterns</h2>');
        (0, vitest_1.expect)(html).toContain('<h3>Pattern 1: Table-Driven Tests</h3>');
        (0, vitest_1.expect)(html).toContain('<code class="language-go">');
        // No <ul> here — the ├── lines are inside a code block, not markdown lists
        (0, vitest_1.expect)(html).toContain('<table>');
        (0, vitest_1.expect)(html).toContain('<th>Flag</th>');
        (0, vitest_1.expect)(html).toContain('<th>Description</th>');
        (0, vitest_1.expect)(html).toContain('<td><code>-v</code></td>');
        (0, vitest_1.expect)(html).toContain('<hr>');
        (0, vitest_1.expect)(html).toContain('<a href="https://go.dev/doc">testing docs</a>');
    });
    (0, vitest_1.it)('preserves code content verbatim (no HTML escaping inside code blocks)', () => {
        const html = (0, MarkdownConverter_1.markdownToHtml)('```\n<a href="test">\n```');
        (0, vitest_1.expect)(html).toContain('&lt;a href=&quot;test&quot;&gt;');
        // Inside code blocks, HTML is escaped for safety
        (0, vitest_1.expect)(html).not.toContain('<a href=');
    });
});
//# sourceMappingURL=MarkdownConverter.test.js.map