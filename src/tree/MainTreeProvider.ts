import * as vscode from 'vscode';
import { TreeNode, toTreeItem } from './TreeNode';
import { Skill, skillSourceLabel } from '../model/Skill';
import { Agent } from '../model/Agent';
import { ClaudeSettingsFile } from '../model/ClaudeSettings';
import { scanAllSkills } from '../discovery/SkillScanner';
import { resolveAllAgents } from '../discovery/AgentResolver';
import { resolveClaudeSettings } from '../discovery/ClaudeSettingsResolver';
import { detectProject } from '../discovery/ProjectDetector';

/**
 * Main TreeDataProvider for the AI Context view.
 */
export class MainTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private skills: Skill[] = [];
  private agents: Agent[] = [];
  private claudeSettings: ClaudeSettingsFile[] = [];
  private projectRoot?: string;

  constructor() {
    this.refresh();
  }

  /**
   * Refresh all data from disk.
   */
  refresh(): void {
    const project = detectProject();
    this.projectRoot = project?.rootPath;

    this.skills = scanAllSkills(this.projectRoot);
    this.claudeSettings = resolveClaudeSettings(this.projectRoot);
    this.agents = resolveAllAgents({
      projectConfigPath: project?.configPath,
      includeHidden: false, // Skip hidden agents by default
    });

    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Return children for a given node (or root).
   */
  getChildren(element?: TreeNode): TreeNode[] {
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
  getTreeItem(element: TreeNode): vscode.TreeItem {
    return toTreeItem(element);
  }

  /**
   * Get the root node.
   */
  getRoot(): TreeNode {
    return this.buildRoot();
  }

  /**
   * Get all skills (for search).
   */
  getAllSkills(): Skill[] {
    return this.skills;
  }

  /**
   * Get all agents (for search).
   */
  getAllAgents(): Agent[] {
    return this.agents;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private buildRoot(): TreeNode {
    const projectName = this.projectRoot
      ? this.projectRoot.split('/').pop() ?? 'AI Context'
      : 'AI Context';
    return {
      kind: 'root',
      label: projectName,
    };
  }

  private buildCategories(): TreeNode[] {
    const categories: TreeNode[] = [
      { kind: 'category', label: '🤖 Agents', icon: 'robot' },
      { kind: 'category', label: '⚡ Skills', icon: 'light-bulb' },
    ];

    if (this.claudeSettings.length > 0) {
      categories.push({ kind: 'category', label: '⚙️ Config', icon: 'gear' });
    }

    return categories;
  }

  private buildCategoryChildren(category: TreeNode & { kind: 'category' }): TreeNode[] {
    if (category.label.includes('Agent')) {
      return this.buildAgentGroups();
    }
    if (category.label.includes('Skill')) {
      return this.buildSkillGroups();
    }
    if (category.label.includes('Config')) {
      return this.buildConfigNodes();
    }
    return [];
  }

  private buildConfigNodes(): TreeNode[] {
    return this.claudeSettings.map((configFile) => ({
      kind: 'config' as const,
      label: `Claude Code (${configFile.scope})`,
      configFile,
    }));
  }

  private buildAgentGroups(): TreeNode[] {
    const primary = this.agents.filter((a) => a.mode === 'primary');
    const subagents = this.agents.filter((a) => a.mode === 'subagent');

    const groups: TreeNode[] = [];

    if (primary.length > 0) {
      groups.push({
        kind: 'group',
        label: 'Primary',
        icon: 'person',
        count: primary.length,
      } as TreeNode);
    }

    if (subagents.length > 0) {
      groups.push({
        kind: 'group',
        label: 'Subagents',
        icon: 'tools',
        count: subagents.length,
      } as TreeNode);
    }

    return groups;
  }

  private buildSkillGroups(): TreeNode[] {
    // Group skills by source
    const bySource = new Map<string, Skill[]>();
    for (const skill of this.skills) {
      const sourceLabel = skillSourceLabel(skill.source);
      const list = bySource.get(sourceLabel) ?? [];
      list.push(skill);
      bySource.set(sourceLabel, list);
    }

    // Sort: Global first, then Claude, then project sources, then rest
    const order = ['Global', 'Claude', 'Proyecto (OpenCode)', 'Proyecto (Claude)', 'Ecosistema', 'Usuario'];
    const groups: TreeNode[] = [];

    for (const key of order) {
      const items = bySource.get(key);
      if (items && items.length > 0) {
        groups.push({
          kind: 'group',
          label: key,
          icon: 'folder',
          count: items.length,
        } as TreeNode);
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
        } as TreeNode);
      }
    }

    return groups;
  }

  private buildGroupChildren(group: TreeNode & { kind: 'group' }): TreeNode[] {
    // Find which category this group belongs to by looking at group label
    // We need to match the group to its skills/agents
    // Since we don't have a back-reference, we figure it out by context

    // Check if it's an agent group
    if (group.label === 'Primary' || group.label.startsWith('Primary')) {
      return this.agents
        .filter((a) => a.mode === 'primary')
        .map((agent) => ({ kind: 'agent' as const, agent }));
    }

    if (group.label === 'Subagents' || group.label.startsWith('Subagents')) {
      return this.agents
        .filter((a) => a.mode === 'subagent')
        .map((agent) => ({ kind: 'agent' as const, agent }));
    }

    // It's a skill group — map source label to the actual SkillSource
    const sourceMap: Record<string, string> = {
      Global: 'global',
      Claude: 'claude',
      'Proyecto (OpenCode)': 'project-opencode',
      'Proyecto (Claude)': 'project-claude',
      Ecosistema: 'ecosystem',
      Usuario: 'user',
    };

    const source = sourceMap[group.label] ?? group.label.toLowerCase();
    return this.skills
      .filter((s) => s.source === source)
      .map((skill) => ({ kind: 'skill' as const, skill }));
  }
}
