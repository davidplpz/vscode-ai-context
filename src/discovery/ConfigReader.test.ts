import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { readOpenCodeConfig } from './ConfigReader';

describe('ConfigReader', () => {
  it('parses JSON without comments', () => {
    const dir = fs.mkdtempSync('test-config-');
    const filePath = path.join(dir, 'opencode.json');
    fs.writeFileSync(filePath, JSON.stringify({ agent: { test: { description: 'hello', mode: 'primary' } } }));

    const config = readOpenCodeConfig(filePath);
    expect(config).toBeDefined();
    expect(config?.agent?.test.description).toBe('hello');

    fs.rmSync(dir, { recursive: true });
  });

  it('parses JSONC with comments', () => {
    const dir = fs.mkdtempSync('test-configc-');
    const filePath = path.join(dir, 'opencode.jsonc');
    fs.writeFileSync(filePath, [
      '{',
      '  // this is a comment',
      '  "agent": {',
      '    "test": {',
      '      "description": "with comments",',
      '      "mode": "subagent"',
      '    }',
      '  }',
      '}',
    ].join('\n'));

    const config = readOpenCodeConfig(filePath);
    expect(config).toBeDefined();
    expect(config?.agent?.test.description).toBe('with comments');
    expect(config?.agent?.test.mode).toBe('subagent');

    fs.rmSync(dir, { recursive: true });
  });

  it('returns undefined for non-existent file', () => {
    const config = readOpenCodeConfig('/nonexistent/path.json');
    expect(config).toBeUndefined();
  });

  it('returns empty object for malformed JSON (jsonc-parser is tolerant)', () => {
    const dir = fs.mkdtempSync('test-bad-');
    const filePath = path.join(dir, 'bad.json');
    fs.writeFileSync(filePath, '{ invalid json }');

    // jsonc-parser is tolerant and returns {} for unrecognizable content
    const config = readOpenCodeConfig(filePath);
    expect(config).toEqual({});

    fs.rmSync(dir, { recursive: true });
  });

  it('returns undefined for empty file', () => {
    const dir = fs.mkdtempSync('test-empty-');
    const filePath = path.join(dir, 'empty.json');
    fs.writeFileSync(filePath, '');

    const config = readOpenCodeConfig(filePath);
    expect(config).toBeUndefined();

    fs.rmSync(dir, { recursive: true });
  });

  it('parses trailing comma', () => {
    const dir = fs.mkdtempSync('test-trail-');
    const filePath = path.join(dir, 'trailing.json');
    fs.writeFileSync(filePath, [
      '{',
      '  "agent": { "test": { "description": "trailing" } },',
      '}',
    ].join('\n'));

    const config = readOpenCodeConfig(filePath);
    expect(config).toBeDefined();
    expect(config?.agent?.test.description).toBe('trailing');

    fs.rmSync(dir, { recursive: true });
  });
});
