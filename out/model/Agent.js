"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAgentDetail = toAgentDetail;
/**
 * Create a display detail from an agent (truncates prompt).
 */
function toAgentDetail(agent) {
    const maxPromptLen = 120;
    const promptPreview = agent.prompt.length > maxPromptLen
        ? agent.prompt.slice(0, maxPromptLen) + '...'
        : agent.prompt;
    return {
        name: agent.name,
        description: agent.description,
        mode: agent.mode,
        model: agent.model,
        hidden: agent.hidden,
        tools: agent.tools,
        promptPreview,
    };
}
//# sourceMappingURL=Agent.js.map