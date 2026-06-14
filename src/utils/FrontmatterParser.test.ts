import { describe, it, expect } from 'vitest';
import { parseFrontmatter, stripFrontmatter, hasFrontmatter } from './FrontmatterParser';

describe('FrontmatterParser', () => {
  describe('hasFrontmatter', () => {
    it('detects frontmatter with valid delimiters', () => {
      expect(hasFrontmatter('---\nkey: value\n---\nbody')).toBe(true);
    });

    it('rejects content without frontmatter', () => {
      expect(hasFrontmatter('just a body')).toBe(false);
    });

    it('detects opening delimiter even without close', () => {
      // hasFrontmatter only checks for opening delimiter, which is sufficient
      expect(hasFrontmatter('---\nnot closed')).toBe(true);
    });
  });

  describe('stripFrontmatter', () => {
    it('removes frontmatter and returns body', () => {
      const result = stripFrontmatter('---\nkey: value\n---\nbody content');
      expect(result).toBe('body content');
    });

    it('returns whole content if no frontmatter', () => {
      const result = stripFrontmatter('just body');
      expect(result).toBe('just body');
    });
  });

  describe('parseFrontmatter', () => {
    it('parses simple scalar values', () => {
      const { frontmatter, body } = parseFrontmatter('---\nname: go-testing\ndescription: Test skill\n---\nbody here');
      expect(frontmatter.name).toBe('go-testing');
      expect(frontmatter.description).toBe('Test skill');
      expect(body).toBe('body here');
    });

    it('parses folded block scalar (>)', () => {
      const content = [
        '---',
        'description: >',
        '  Multi-line description that',
        '  spans several lines.',
        '  Trigger: when testing.',
        '---',
        'body',
      ].join('\n');

      const { frontmatter } = parseFrontmatter(content);
      expect(frontmatter.description).toBe('Multi-line description that spans several lines. Trigger: when testing.');
    });

    it('parses dot-notation keys as nested objects', () => {
      const { frontmatter } = parseFrontmatter('---\nmetadata.author: gentleman\nmetadata.version: "1.0"\n---\nbody');
      expect(frontmatter.metadata).toEqual({
        author: 'gentleman',
        version: '1.0',
      });
    });

    it('parses nested indented keys', () => {
      const content = [
        '---',
        'metadata:',
        '  author: gentleman',
        '  version: "2.0"',
        '---',
        'body',
      ].join('\n');

      const { frontmatter } = parseFrontmatter(content);
      expect(frontmatter.metadata).toEqual({
        author: 'gentleman',
        version: '2.0',
      });
    });

    it('parses boolean values', () => {
      const { frontmatter } = parseFrontmatter('---\nhidden: true\nactive: false\n---\nbody');
      expect(frontmatter.hidden).toBe(true);
      expect(frontmatter.active).toBe(false);
    });

    it('parses numeric values', () => {
      const { frontmatter } = parseFrontmatter('---\nversion: 1.0\ncount: 42\n---\nbody');
      expect(frontmatter.version).toBe(1.0);
      expect(frontmatter.count).toBe(42);
    });

    it('handles quoted strings', () => {
      const { frontmatter } = parseFrontmatter("---\nname: 'go-testing'\ndesc: \"hello world\"\n---\nbody");
      expect(frontmatter.name).toBe('go-testing');
      expect(frontmatter.desc).toBe('hello world');
    });

    it('skips comments in frontmatter', () => {
      const { frontmatter } = parseFrontmatter('---\n# this is a comment\nname: go-testing\n---\nbody');
      expect(frontmatter.name).toBe('go-testing');
      expect(frontmatter['# this is a comment']).toBeUndefined();
    });

    it('returns empty frontmatter and full body if no delimiters', () => {
      const { frontmatter, body } = parseFrontmatter('just body\ncontent');
      expect(frontmatter).toEqual({});
      expect(body).toBe('just body\ncontent');
    });

    it('returns full content as body when --- is not followed by newline', () => {
      // The regex requires \n---\s*\n as closing delimiter. `---\n---\nbody`
      // has `---\n` as the first `---` then `---\nbody` — no closing \n---\n.
      const { frontmatter, body } = parseFrontmatter('---\n---\nbody');
      expect(frontmatter).toEqual({});
      expect(body).toBe('---\n---\nbody');
    });

    it('handles real-world SKILL.md frontmatter', () => {
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

      const { frontmatter, body } = parseFrontmatter(content);
      expect(frontmatter.name).toBe('go-testing');
      expect(frontmatter.license).toBe('Apache-2.0');
      expect(frontmatter.description).toContain('Trigger:');
      expect(frontmatter.metadata).toEqual({
        author: 'gentleman-programming',
        version: '1.0',
      });
      expect(body).toContain('## When to Use');
      expect(body).toContain('Use this skill when writing Go tests.');
    });
  });
});
