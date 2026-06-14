"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSearch = showSearch;
exports.openSkillFile = openSkillFile;
exports.showAgentDetail = showAgentDetail;
const vscode = __importStar(require("vscode"));
const Agent_1 = require("../model/Agent");
/**
 * Open a QuickPick to search across skills and agents.
 */
async function showSearch(treeProvider) {
    const skills = treeProvider.getAllSkills();
    const agents = treeProvider.getAllAgents();
    // Build quick pick items
    const skillItems = skills.map((skill) => ({
        label: `$(code) ${skill.name}`,
        description: skill.source,
        detail: skill.description.slice(0, 120),
        // Store skill name so we can look it up later
    }));
    const agentItems = agents.map((agent) => {
        const detail = (0, Agent_1.toAgentDetail)(agent);
        return {
            label: `$(person) ${agent.name}`,
            description: agent.mode,
            detail: detail.description,
        };
    });
    // Create separator items
    const allItems = [
        ...(skillItems.length > 0
            ? [{ label: 'Skills', kind: vscode.QuickPickItemKind.Separator }, ...skillItems]
            : []),
        ...(agentItems.length > 0
            ? [{ label: 'Agents', kind: vscode.QuickPickItemKind.Separator }, ...agentItems]
            : []),
    ];
    // Attach type info
    const mappedItems = allItems.map((item) => {
        const skill = skills.find((s) => `$(code) ${s.name}` === item.label);
        if (skill) {
            return { ...item, __type: 'skill', __name: skill.name };
        }
        const agent = agents.find((a) => `$(person) ${a.name}` === item.label);
        if (agent) {
            return { ...item, __type: 'agent', __name: agent.name };
        }
        return { ...item };
    });
    const pick = await vscode.window.showQuickPick(mappedItems, {
        placeHolder: 'Search skills and agents by name or description...',
        matchOnDescription: true,
        matchOnDetail: true,
    });
    if (!pick)
        return;
    if (pick.__type === 'skill') {
        const skill = skills.find((s) => s.name === pick.__name);
        if (skill) {
            vscode.commands.executeCommand('vscodeAiContext.showSkillDetail', skill);
        }
    }
    else if (pick.__type === 'agent') {
        const agent = agents.find((a) => a.name === pick.__name);
        if (agent) {
            showAgentDetail(agent);
        }
    }
}
/**
 * Open a skill's SKILL.md file in the editor.
 */
function openSkillFile(skill) {
    const uri = vscode.Uri.file(skill.path);
    vscode.workspace.openTextDocument(uri).then((doc) => {
        vscode.window.showTextDocument(doc, { preview: true });
    });
}
/**
 * Show agent detail in an information message.
 */
function showAgentDetail(agent) {
    const detail = (0, Agent_1.toAgentDetail)(agent);
    const lines = [
        `**${detail.name}** — ${detail.mode.toUpperCase()}`,
        ``,
        detail.description,
        ``,
        `**Tools:** ${detail.tools.join(', ') || '(none)'}`,
        detail.model ? `**Model:** ${detail.model}` : '',
        detail.hidden ? `*(hidden from agent list)*` : '',
        ``,
        `**Prompt:** ${detail.promptPreview}`,
    ];
    const markdown = new vscode.MarkdownString(lines.filter(Boolean).join('\n'));
    markdown.isTrusted = true;
    vscode.window.showInformationMessage(markdown.value, { modal: false });
}
//# sourceMappingURL=QuickSearch.js.map