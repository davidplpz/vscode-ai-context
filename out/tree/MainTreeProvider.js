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
exports.MainTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const TreeNode_1 = require("./TreeNode");
const Skill_1 = require("../model/Skill");
const SkillScanner_1 = require("../discovery/SkillScanner");
const AgentResolver_1 = require("../discovery/AgentResolver");
const ProjectDetector_1 = require("../discovery/ProjectDetector");
/**
 * Main TreeDataProvider for the AI Context view.
 */
class MainTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    skills = [];
    agents = [];
    projectRoot;
    constructor() {
        this.refresh();
    }
    /**
     * Refresh all data from disk.
     */
    refresh() {
        const project = (0, ProjectDetector_1.detectProject)();
        this.projectRoot = project?.rootPath;
        // Only scan if project has opencode or we want global context
        this.skills = (0, SkillScanner_1.scanAllSkills)(this.projectRoot);
        this.agents = (0, AgentResolver_1.resolveAllAgents)({
            projectConfigPath: project?.configPath,
            includeHidden: false, // Skip hidden agents by default
        });
        this._onDidChangeTreeData.fire(undefined);
    }
    /**
     * Return children for a given node (or root).
     */
    getChildren(element) {
        if (!element) {
            return [this.buildRoot()];
        }
        switch (element.kind) {
            case 'root':
                return this.buildCategories();
            case 'category':
                return this.buildCategoryChildren(element);
            case 'group':
                return this.buildGroupChildren(element);
            default:
                return [];
        }
    }
    /**
     * Return the TreeItem for a node.
     */
    getTreeItem(element) {
        return (0, TreeNode_1.toTreeItem)(element);
    }
    /**
     * Get the root node.
     */
    getRoot() {
        return this.buildRoot();
    }
    /**
     * Get all skills (for search).
     */
    getAllSkills() {
        return this.skills;
    }
    /**
     * Get all agents (for search).
     */
    getAllAgents() {
        return this.agents;
    }
    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------
    buildRoot() {
        const projectName = this.projectRoot
            ? this.projectRoot.split('/').pop() ?? 'AI Context'
            : 'AI Context';
        return {
            kind: 'root',
            label: projectName,
        };
    }
    buildCategories() {
        return [
            { kind: 'category', label: '🤖 Agents', icon: 'robot' },
            { kind: 'category', label: '⚡ Skills', icon: 'light-bulb' },
        ];
    }
    buildCategoryChildren(category) {
        if (category.label.includes('Agent')) {
            return this.buildAgentGroups();
        }
        if (category.label.includes('Skill')) {
            return this.buildSkillGroups();
        }
        return [];
    }
    buildAgentGroups() {
        const primary = this.agents.filter((a) => a.mode === 'primary');
        const subagents = this.agents.filter((a) => a.mode === 'subagent');
        const groups = [];
        if (primary.length > 0) {
            groups.push({
                kind: 'group',
                label: 'Primary',
                icon: 'person',
                count: primary.length,
            });
        }
        if (subagents.length > 0) {
            groups.push({
                kind: 'group',
                label: 'Subagents',
                icon: 'tools',
                count: subagents.length,
            });
        }
        return groups;
    }
    buildSkillGroups() {
        // Group skills by source
        const bySource = new Map();
        for (const skill of this.skills) {
            const sourceLabel = (0, Skill_1.skillSourceLabel)(skill.source);
            const list = bySource.get(sourceLabel) ?? [];
            list.push(skill);
            bySource.set(sourceLabel, list);
        }
        // Sort: Global first, then Proyecto, then rest
        const order = ['Global', 'Proyecto', 'Ecosistema', 'Usuario'];
        const groups = [];
        for (const key of order) {
            const items = bySource.get(key);
            if (items && items.length > 0) {
                groups.push({
                    kind: 'group',
                    label: key,
                    icon: 'folder',
                    count: items.length,
                });
            }
        }
        // Any remaining sources not in order
        for (const [key, items] of bySource) {
            if (!order.includes(key)) {
                groups.push({
                    kind: 'group',
                    label: key,
                    icon: 'folder',
                    count: items.length,
                });
            }
        }
        return groups;
    }
    buildGroupChildren(group) {
        // Find which category this group belongs to by looking at group label
        // We need to match the group to its skills/agents
        // Since we don't have a back-reference, we figure it out by context
        // Check if it's an agent group
        if (group.label === 'Primary' || group.label.startsWith('Primary')) {
            return this.agents
                .filter((a) => a.mode === 'primary')
                .map((agent) => ({ kind: 'agent', agent }));
        }
        if (group.label === 'Subagents' || group.label.startsWith('Subagents')) {
            return this.agents
                .filter((a) => a.mode === 'subagent')
                .map((agent) => ({ kind: 'agent', agent }));
        }
        // It's a skill group — map source label to the actual SkillSource
        const sourceMap = {
            Global: 'global',
            Proyecto: 'project',
            Ecosistema: 'ecosystem',
            Usuario: 'user',
        };
        const source = sourceMap[group.label] ?? group.label.toLowerCase();
        return this.skills
            .filter((s) => s.source === source)
            .map((skill) => ({ kind: 'skill', skill }));
    }
}
exports.MainTreeProvider = MainTreeProvider;
//# sourceMappingURL=MainTreeProvider.js.map