"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const FrontmatterParser_1 = require("./FrontmatterParser");
(0, vitest_1.describe)('FrontmatterParser', () => {
    (0, vitest_1.describe)('hasFrontmatter', () => {
        (0, vitest_1.it)('detects frontmatter with valid delimiters', () => {
            (0, vitest_1.expect)((0, FrontmatterParser_1.hasFrontmatter)('---\nkey: value\n---\nbody')).toBe(true);
        });
        (0, vitest_1.it)('rejects content without frontmatter', () => {
            (0, vitest_1.expect)((0, FrontmatterParser_1.hasFrontmatter)('just a body')).toBe(false);
        });
        (0, vitest_1.it)('detects opening delimiter even without close', () => {
            // hasFrontmatter only checks for opening delimiter, which is sufficient
            (0, vitest_1.expect)((0, FrontmatterParser_1.hasFrontmatter)('---\nnot closed')).toBe(true);
        });
    });
    (0, vitest_1.describe)('stripFrontmatter', () => {
        (0, vitest_1.it)('removes frontmatter and returns body', () => {
            const result = (0, FrontmatterParser_1.stripFrontmatter)('---\nkey: value\n---\nbody content');
            (0, vitest_1.expect)(result).toBe('body content');
        });
        (0, vitest_1.it)('returns whole content if no frontmatter', () => {
            const result = (0, FrontmatterParser_1.stripFrontmatter)('just body');
            (0, vitest_1.expect)(result).toBe('just body');
        });
    });
    (0, vitest_1.describe)('parseFrontmatter', () => {
        (0, vitest_1.it)('parses simple scalar values', () => {
            const { frontmatter, body } = (0, FrontmatterParser_1.parseFrontmatter)('---\nname: go-testing\ndescription: Test skill\n---\nbody here');
            (0, vitest_1.expect)(frontmatter.name).toBe('go-testing');
            (0, vitest_1.expect)(frontmatter.description).toBe('Test skill');
            (0, vitest_1.expect)(body).toBe('body here');
        });
        (0, vitest_1.it)('parses folded block scalar (>)', () => {
            const content = [
                '---',
                'description: >',
                '  Multi-line description that',
                '  spans several lines.',
                '  Trigger: when testing.',
                '---',
                'body',
            ].join('\n');
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)(content);
            (0, vitest_1.expect)(frontmatter.description).toBe('Multi-line description that spans several lines. Trigger: when testing.');
        });
        (0, vitest_1.it)('parses dot-notation keys as nested objects', () => {
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)('---\nmetadata.author: gentleman\nmetadata.version: "1.0"\n---\nbody');
            (0, vitest_1.expect)(frontmatter.metadata).toEqual({
                author: 'gentleman',
                version: '1.0',
            });
        });
        (0, vitest_1.it)('parses nested indented keys', () => {
            const content = [
                '---',
                'metadata:',
                '  author: gentleman',
                '  version: "2.0"',
                '---',
                'body',
            ].join('\n');
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)(content);
            (0, vitest_1.expect)(frontmatter.metadata).toEqual({
                author: 'gentleman',
                version: '2.0',
            });
        });
        (0, vitest_1.it)('parses boolean values', () => {
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)('---\nhidden: true\nactive: false\n---\nbody');
            (0, vitest_1.expect)(frontmatter.hidden).toBe(true);
            (0, vitest_1.expect)(frontmatter.active).toBe(false);
        });
        (0, vitest_1.it)('parses numeric values', () => {
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)('---\nversion: 1.0\ncount: 42\n---\nbody');
            (0, vitest_1.expect)(frontmatter.version).toBe(1.0);
            (0, vitest_1.expect)(frontmatter.count).toBe(42);
        });
        (0, vitest_1.it)('handles quoted strings', () => {
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)("---\nname: 'go-testing'\ndesc: \"hello world\"\n---\nbody");
            (0, vitest_1.expect)(frontmatter.name).toBe('go-testing');
            (0, vitest_1.expect)(frontmatter.desc).toBe('hello world');
        });
        (0, vitest_1.it)('skips comments in frontmatter', () => {
            const { frontmatter } = (0, FrontmatterParser_1.parseFrontmatter)('---\n# this is a comment\nname: go-testing\n---\nbody');
            (0, vitest_1.expect)(frontmatter.name).toBe('go-testing');
            (0, vitest_1.expect)(frontmatter['# this is a comment']).toBeUndefined();
        });
        (0, vitest_1.it)('returns empty frontmatter and full body if no delimiters', () => {
            const { frontmatter, body } = (0, FrontmatterParser_1.parseFrontmatter)('just body\ncontent');
            (0, vitest_1.expect)(frontmatter).toEqual({});
            (0, vitest_1.expect)(body).toBe('just body\ncontent');
        });
        (0, vitest_1.it)('returns full content as body when --- is not followed by newline', () => {
            // The regex requires \n---\s*\n as closing delimiter. `---\n---\nbody`
            // has `---\n` as the first `---` then `---\nbody` — no closing \n---\n.
            const { frontmatter, body } = (0, FrontmatterParser_1.parseFrontmatter)('---\n---\nbody');
            (0, vitest_1.expect)(frontmatter).toEqual({});
            (0, vitest_1.expect)(body).toBe('---\n---\nbody');
        });
        (0, vitest_1.it)('handles real-world SKILL.md frontmatter', () => {
            const content = [
                '---',
                'name: go-testing',
                'description: >',
                '  Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing.',
                '  Trigger: When writing Go tests, using teatest, or adding test coverage.',
                'license: Apache-2.0',
                'metadata:',
                '  author: gentleman-programming',
                '  version: "1.0"',
                '---',
                '## When to Use',
                '',
                'Use this skill when writing Go tests.',
            ].join('\n');
            const { frontmatter, body } = (0, FrontmatterParser_1.parseFrontmatter)(content);
            (0, vitest_1.expect)(frontmatter.name).toBe('go-testing');
            (0, vitest_1.expect)(frontmatter.license).toBe('Apache-2.0');
            (0, vitest_1.expect)(frontmatter.description).toContain('Trigger:');
            (0, vitest_1.expect)(frontmatter.metadata).toEqual({
                author: 'gentleman-programming',
                version: '1.0',
            });
            (0, vitest_1.expect)(body).toContain('## When to Use');
            (0, vitest_1.expect)(body).toContain('Use this skill when writing Go tests.');
        });
    });
});
//# sourceMappingURL=FrontmatterParser.test.js.map