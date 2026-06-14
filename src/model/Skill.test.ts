import { describe, it, expect } from 'vitest';
import { extractTriggers, skillSourceLabel } from './Skill';

describe('Skill', () => {
  describe('extractTriggers', () => {
    it('extracts single trigger from description', () => {
      const desc = 'Go testing patterns. Trigger: When writing Go tests.';
      expect(extractTriggers(desc)).toEqual(['When writing Go tests']);
    });

    it('extracts multiple triggers separated by commas', () => {
      const desc = 'Patterns. Trigger: When writing tests, using teatest, adding coverage.';
      expect(extractTriggers(desc)).toEqual([
        'When writing tests',
        'using teatest',
        'adding coverage',
      ]);
    });

    it('returns empty array when no trigger keyword', () => {
      expect(extractTriggers('Just a description')).toEqual([]);
    });

    it('handles trigger with quoted values', () => {
      const desc = 'Trigger: "judgment day", "review"';
      expect(extractTriggers(desc)).toEqual(['judgment day', 'review']);
    });

    it('extracts quoted triggers even with prefix text', () => {
      // Quoted values take precedence over the surrounding text
      const desc = 'Skill for X. Trigger: When user says: "do X".';
      const triggers = extractTriggers(desc);
      expect(triggers.length).toBe(1);
      expect(triggers[0]).toBe('do X');
    });

    it('handles real-world judgment-day triggers', () => {
      const desc = [
        'Parallel adversarial review protocol.',
        'Trigger: When user says "judgment day", "judgment-day", "review adversarial",',
        '"doble review", "juzgar", "que lo juzguen".',
      ].join(' ');
      const triggers = extractTriggers(desc);
      expect(triggers.length).toBeGreaterThanOrEqual(5);
      expect(triggers).toContain('judgment day');
      expect(triggers).toContain('juzgar');
    });
  });

  describe('skillSourceLabel', () => {
    it('returns labels for each source', () => {
      expect(skillSourceLabel('global')).toBe('Global');
      expect(skillSourceLabel('project')).toBe('Proyecto');
      expect(skillSourceLabel('ecosystem')).toBe('Ecosistema');
      expect(skillSourceLabel('user')).toBe('Usuario');
    });
  });
});
