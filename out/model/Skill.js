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
    const text = triggerMatch[1];
    // Try to extract quoted values first — handles patterns like:
    //   Trigger: When user says "judgment day", "juzgar"
    //   → extracts ["judgment day", "juzgar"]
    const quoted = [];
    const quoteRegex = /"([^"]+)"/g;
    let qMatch;
    while ((qMatch = quoteRegex.exec(text)) !== null) {
        quoted.push(qMatch[1]);
    }
    if (quoted.length > 0)
        return quoted;
    // Fall back to comma/semicolon separated values:
    //   Trigger: When writing tests, using teatest
    //   → ["When writing tests", "using teatest"]
    return text
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
        claude: 'Claude',
    };
    return labels[source];
}
//# sourceMappingURL=Skill.js.map