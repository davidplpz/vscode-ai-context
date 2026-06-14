"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFrontmatter = parseFrontmatter;
exports.stripFrontmatter = stripFrontmatter;
exports.hasFrontmatter = hasFrontmatter;
/**
 * Minimal YAML frontmatter parser.
 *
 * Handles the subset of YAML used in SKILL.md frontmatter:
 * - Scalar values (strings, numbers, booleans)
 * - Multi-line strings with `>` (folded block scalars)
 * - Nested keys with dot notation or indentation
 * - Comments (#)
 */
function parseFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) {
        return { frontmatter: {}, body: content };
    }
    const yamlBlock = match[1];
    const body = match[2].trimStart();
    return {
        frontmatter: parseYamlBlock(yamlBlock),
        body,
    };
}
/**
 * Strip frontmatter and return only the body content.
 */
function stripFrontmatter(content) {
    return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '').trimStart();
}
/**
 * Check if content has frontmatter.
 */
function hasFrontmatter(content) {
    return /^---\s*\n/.test(content);
}
// ---------------------------------------------------------------------------
// Minimal YAML parser — supports the subset used in SKILL.md files
// ---------------------------------------------------------------------------
function parseYamlBlock(block) {
    const result = {};
    const lines = block.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        i++;
        // Skip empty lines and comments
        if (line.trim() === '' || line.trim().startsWith('#'))
            continue;
        // Check if it's a key-value line (indented or not)
        const kvMatch = line.match(/^(\s*)([\w.-]+):\s*(.*)$/);
        if (!kvMatch)
            continue;
        const indent = kvMatch[1];
        const key = kvMatch[2];
        let value = kvMatch[3].trim();
        if (value === '>') {
            // Folded block scalar (`>`) — ALWAYS collect indented lines as folded text.
            // `i` already points to the first continuation line (incremented in while loop).
            // Must check BEFORE the nested block check, because the continuation lines
            // look like indented blocks.
            value = collectFolded(lines, i, indent + '  ');
        }
        else if (value === '') {
            // Could be a nested object or empty value
            if (i < lines.length && lines[i].startsWith(indent + '  ')) {
                const nested = collectNested(lines, i, indent + '  ');
                i = nested.nextIndex;
                value = nested.result;
            }
            // else: empty value
        }
        else {
            value = parseScalar(value);
        }
        // Handle dot-notation keys (e.g. "metadata.author")
        if (key.includes('.')) {
            setNested(result, key, value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
function collectNested(lines, startIndex, baseIndent) {
    const nested = {};
    let i = startIndex;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.startsWith(baseIndent))
            break;
        const kvMatch = line.match(/^(\s*)([\w-]+):\s*(.*)$/);
        if (kvMatch) {
            const key = kvMatch[2];
            const value = kvMatch[3].trim();
            nested[key] = value === '' ? '' : parseScalar(value);
        }
        i++;
    }
    return { result: nested, nextIndex: i };
}
function collectFolded(lines, startIndex, baseIndent) {
    const parts = [];
    let i = startIndex;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.startsWith(baseIndent))
            break;
        parts.push(line.trim());
        i++;
    }
    return parts.join(' ');
}
function parseScalar(value) {
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    if (/^\d+(\.\d+)?$/.test(value))
        return Number(value);
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}
function setNested(obj, key, value) {
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}
//# sourceMappingURL=FrontmatterParser.js.map