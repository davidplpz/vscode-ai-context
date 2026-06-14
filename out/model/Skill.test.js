"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Skill_1 = require("./Skill");
(0, vitest_1.describe)('Skill', () => {
    (0, vitest_1.describe)('extractTriggers', () => {
        (0, vitest_1.it)('extracts single trigger from description', () => {
            const desc = 'Go testing patterns. Trigger: When writing Go tests.';
            (0, vitest_1.expect)((0, Skill_1.extractTriggers)(desc)).toEqual(['When writing Go tests']);
        });
        (0, vitest_1.it)('extracts multiple triggers separated by commas', () => {
            const desc = 'Patterns. Trigger: When writing tests, using teatest, adding coverage.';
            (0, vitest_1.expect)((0, Skill_1.extractTriggers)(desc)).toEqual([
                'When writing tests',
                'using teatest',
                'adding coverage',
            ]);
        });
        (0, vitest_1.it)('returns empty array when no trigger keyword', () => {
            (0, vitest_1.expect)((0, Skill_1.extractTriggers)('Just a description')).toEqual([]);
        });
        (0, vitest_1.it)('handles trigger with quoted values', () => {
            const desc = 'Trigger: "judgment day", "review"';
            (0, vitest_1.expect)((0, Skill_1.extractTriggers)(desc)).toEqual(['judgment day', 'review']);
        });
        (0, vitest_1.it)('extracts quoted triggers even with prefix text', () => {
            // Quoted values take precedence over the surrounding text
            const desc = 'Skill for X. Trigger: When user says: "do X".';
            const triggers = (0, Skill_1.extractTriggers)(desc);
            (0, vitest_1.expect)(triggers.length).toBe(1);
            (0, vitest_1.expect)(triggers[0]).toBe('do X');
        });
        (0, vitest_1.it)('handles real-world judgment-day triggers', () => {
            const desc = [
                'Parallel adversarial review protocol.',
                'Trigger: When user says "judgment day", "judgment-day", "review adversarial",',
                '"doble review", "juzgar", "que lo juzguen".',
            ].join(' ');
            const triggers = (0, Skill_1.extractTriggers)(desc);
            (0, vitest_1.expect)(triggers.length).toBeGreaterThanOrEqual(5);
            (0, vitest_1.expect)(triggers).toContain('judgment day');
            (0, vitest_1.expect)(triggers).toContain('juzgar');
        });
    });
    (0, vitest_1.describe)('skillSourceLabel', () => {
        (0, vitest_1.it)('returns labels for each source', () => {
            (0, vitest_1.expect)((0, Skill_1.skillSourceLabel)('global')).toBe('Global');
            (0, vitest_1.expect)((0, Skill_1.skillSourceLabel)('project')).toBe('Proyecto');
            (0, vitest_1.expect)((0, Skill_1.skillSourceLabel)('ecosystem')).toBe('Ecosistema');
            (0, vitest_1.expect)((0, Skill_1.skillSourceLabel)('user')).toBe('Usuario');
        });
    });
});
//# sourceMappingURL=Skill.test.js.map