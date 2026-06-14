"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Agent_1 = require("./Agent");
(0, vitest_1.describe)('Agent', () => {
    (0, vitest_1.describe)('toAgentDetail', () => {
        (0, vitest_1.it)('converts agent to display detail', () => {
            const agent = {
                name: 'sdd-apply',
                description: 'Implement code changes',
                mode: 'subagent',
                hidden: true,
                tools: ['bash', 'edit', 'read', 'write'],
                prompt: 'Read your skill file at SKILL.md and follow it exactly.',
                source: 'global',
            };
            const detail = (0, Agent_1.toAgentDetail)(agent);
            (0, vitest_1.expect)(detail.name).toBe('sdd-apply');
            (0, vitest_1.expect)(detail.description).toBe('Implement code changes');
            (0, vitest_1.expect)(detail.mode).toBe('subagent');
            (0, vitest_1.expect)(detail.hidden).toBe(true);
            (0, vitest_1.expect)(detail.tools).toEqual(['bash', 'edit', 'read', 'write']);
        });
        (0, vitest_1.it)('truncates long prompts', () => {
            const agent = {
                name: 'test',
                description: 'Test agent',
                mode: 'subagent',
                hidden: false,
                tools: [],
                prompt: 'a'.repeat(200),
                source: 'project',
            };
            const detail = (0, Agent_1.toAgentDetail)(agent);
            (0, vitest_1.expect)(detail.promptPreview.length).toBeLessThan(200);
            (0, vitest_1.expect)(detail.promptPreview.endsWith('...')).toBe(true);
        });
        (0, vitest_1.it)('handles primary agents with model', () => {
            const agent = {
                name: 'gentleman',
                description: 'Senior Architect',
                mode: 'primary',
                model: 'opencode/big-pickle',
                hidden: false,
                tools: ['edit', 'write'],
                prompt: '{file:./AGENTS.md}',
                source: 'global',
            };
            const detail = (0, Agent_1.toAgentDetail)(agent);
            (0, vitest_1.expect)(detail.model).toBe('opencode/big-pickle');
            (0, vitest_1.expect)(detail.promptPreview).toBe('{file:./AGENTS.md}');
        });
    });
});
//# sourceMappingURL=Agent.test.js.map