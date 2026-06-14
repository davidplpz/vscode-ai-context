"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTriggers = extractTriggers;
exports.skillSourceLabel = skillSourceLabel;
/**
 * Extract trigger keywords from a skill description.
 * Looks for "Trigger:" or "Trigger —" patterns.
 */
function extractTriggers(description) {
    const triggerMatch = description.match(/Trigger:\s*(.+?)(?:\.|$)/);
    if (!triggerMatch)
        return [];
    return triggerMatch[1]
        .split(/[,;]/)
        .map((t) => t.trim().replace(/^"(.*)"$/, '$1'))
        .filter(Boolean);
}
/**
 * Display name for a skill source.
 */
function skillSourceLabel(source) {
    const labels = {
        global: 'Global',
        project: 'Proyecto',
        ecosystem: 'Ecosistema',
        user: 'Usuario',
    };
    return labels[source];
}
//# sourceMappingURL=Skill.js.map