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
exports.toTreeItem = toTreeItem;
const vscode = __importStar(require("vscode"));
/**
 * Convert a TreeNode to a VS Code TreeItem.
 */
function toTreeItem(node) {
    switch (node.kind) {
        case 'root':
            return rootItem(node);
        case 'category':
            return categoryItem(node);
        case 'group':
            return groupItem(node);
        case 'skill':
            return skillItem(node);
        case 'agent':
            return agentItem(node);
    }
}
function rootItem(node) {
    const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
    item.contextValue = 'root';
    item.iconPath = new vscode.ThemeIcon('folder-opened');
    item.tooltip = 'Skills & Agents disponibles';
    return item;
}
function categoryItem(node) {
    const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Collapsed);
    item.contextValue = 'category';
    item.iconPath = new vscode.ThemeIcon(node.icon);
    item.tooltip = node.label;
    return item;
}
function groupItem(node) {
    const label = node.count !== undefined
        ? `${node.label} (${node.count})`
        : node.label;
    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
    item.contextValue = 'group';
    item.iconPath = new vscode.ThemeIcon(node.icon);
    item.tooltip = node.label;
    return item;
}
function skillItem(node) {
    const item = new vscode.TreeItem(node.skill.name, vscode.TreeItemCollapsibleState.None);
    item.contextValue = 'skill';
    item.iconPath = new vscode.ThemeIcon('code');
    item.tooltip = new vscode.MarkdownString(`**${node.skill.name}**\n\n${node.skill.description}\n\n*Path:* ${node.skill.path}`);
    item.description = node.skill.source;
    item.command = {
        command: 'vscodeAiContext.showSkillDetail',
        title: 'Show Skill Detail',
        arguments: [node.skill],
    };
    return item;
}
function agentItem(node) {
    const icon = node.agent.mode === 'primary' ? 'person' : 'tools';
    const modeLabel = node.agent.mode === 'primary' ? '👤 Primary' : '🔧 Subagent';
    const item = new vscode.TreeItem(node.agent.name, vscode.TreeItemCollapsibleState.None);
    item.contextValue = 'agent';
    item.iconPath = new vscode.ThemeIcon(icon);
    item.tooltip = new vscode.MarkdownString(`**${node.agent.name}** — ${modeLabel}\n\n${node.agent.description}\n\n` +
        `*Source:* ${node.agent.source}\n` +
        `*Tools:* ${node.agent.tools.join(', ')}\n` +
        `*Model:* ${node.agent.model ?? '(default)'}`);
    item.description = node.agent.mode;
    return item;
}
//# sourceMappingURL=TreeNode.js.map