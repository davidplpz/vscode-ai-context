import { describe, it, expect } from 'vitest';
import { toAgentDetail, Agent } from './Agent';

describe('Agent', () => {
  describe('toAgentDetail', () => {
    it('converts agent to display detail', () => {
      const agent: Agent = {
        name: 'sdd-apply',
        description: 'Implement code changes',
        mode: 'subagent',
        hidden: true,
        tools: ['bash', 'edit', 'read', 'write'],
        prompt: 'Read your skill file at SKILL.md and follow it exactly.',
        source: 'global',
      };

      const detail = toAgentDetail(agent);
      expect(detail.name).toBe('sdd-apply');
      expect(detail.description).toBe('Implement code changes');
      expect(detail.mode).toBe('subagent');
      expect(detail.hidden).toBe(true);
      expect(detail.tools).toEqual(['bash', 'edit', 'read', 'write']);
    });

    it('truncates long prompts', () => {
      const agent: Agent = {
        name: 'test',
        description: 'Test agent',
        mode: 'subagent',
        hidden: false,
        tools: [],
        prompt: 'a'.repeat(200),
        source: 'project',
      };

      const detail = toAgentDetail(agent);
      expect(detail.promptPreview.length).toBeLessThan(200);
      expect(detail.promptPreview.endsWith('...')).toBe(true);
    });

    it('handles primary agents with model', () => {
      const agent: Agent = {
        name: 'gentleman',
        description: 'Senior Architect',
        mode: 'primary',
        model: 'opencode/big-pickle',
        hidden: false,
        tools: ['edit', 'write'],
        prompt: '{file:./AGENTS.md}',
        source: 'global',
      };

      const detail = toAgentDetail(agent);
      expect(detail.model).toBe('opencode/big-pickle');
      expect(detail.promptPreview).toBe('{file:./AGENTS.md}');
    });
  });
});
