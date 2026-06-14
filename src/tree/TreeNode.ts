import * as vscode from 'vscode';
import { Skill } from '../model/Skill';
import { Agent } from '../model/Agent';

/**
 * Discriminated union of all possible tree node types.
 */
export type TreeNode =
  | RootNode
  | CategoryNode
  | GroupNode
  | SkillNode
  | AgentNode;

/** Top-level root */
export interface RootNode {
  kind: 'root';
  label: string;
}

/** A category section (e.g. "Agentes", "Skills") */
export interface CategoryNode {
  kind: 'category';
  label: string;
  icon: string; // codicon name
}

/** A group within a category (e.g. "Primary Agents", "Global Skills") */
export interface GroupNode {
  kind: 'group';
  label: string;
  icon: string;
  count?: number;
}

/** A skill leaf node */
export interface SkillNode {
  kind: 'skill';
  skill: Skill;
}

/** An agent leaf node */
export interface AgentNode {
  kind: 'agent';
  agent: Agent;
}

/**
 * Convert a TreeNode to a VS Code TreeItem.
 */
export function toTreeItem(node: TreeNode): vscode.TreeItem {
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

function rootItem(node: RootNode): vscode.TreeItem {
  const item = new vscode.TreeItem(
    node.label,
    vscode.TreeItemCollapsibleState.Expanded
  );
  item.contextValue = 'root';
  item.iconPath = new vscode.ThemeIcon('folder-opened');
  item.tooltip = 'Skills & Agents disponibles';
  return item;
}

function categoryItem(node: CategoryNode): vscode.TreeItem {
  const item = new vscode.TreeItem(
    node.label,
    vscode.TreeItemCollapsibleState.Collapsed
  );
  item.contextValue = 'category';
  item.iconPath = new vscode.ThemeIcon(node.icon);
  item.tooltip = node.label;
  return item;
}

function groupItem(node: GroupNode): vscode.TreeItem {
  const label = node.count !== undefined
    ? `${node.label} (${node.count})`
    : node.label;

  const item = new vscode.TreeItem(
    label,
    vscode.TreeItemCollapsibleState.Collapsed
  );
  item.contextValue = 'group';
  item.iconPath = new vscode.ThemeIcon(node.icon);
  item.tooltip = node.label;
  return item;
}

function skillItem(node: SkillNode): vscode.TreeItem {
  const item = new vscode.TreeItem(
    node.skill.name,
    vscode.TreeItemCollapsibleState.None
  );
  item.contextValue = 'skill';
  item.iconPath = new vscode.ThemeIcon('code');
  item.tooltip = new vscode.MarkdownString(
    `**${node.skill.name}**\n\n${node.skill.description}\n\n*Path:* ${node.skill.path}`
  );
  item.description = node.skill.source;
  item.command = {
    command: 'vscodeAiContext.showSkillDetail',
    title: 'Show Skill Detail',
    arguments: [node.skill],
  };
  return item;
}

function agentItem(node: AgentNode): vscode.TreeItem {
  const icon = node.agent.mode === 'primary' ? 'person' : 'tools';
  const modeLabel = node.agent.mode === 'primary' ? '👤 Primary' : '🔧 Subagent';

  const item = new vscode.TreeItem(
    node.agent.name,
    vscode.TreeItemCollapsibleState.None
  );
  item.contextValue = 'agent';
  item.iconPath = new vscode.ThemeIcon(icon);
  item.tooltip = new vscode.MarkdownString(
    `**${node.agent.name}** — ${modeLabel}\n\n${node.agent.description}\n\n` +
    `*Source:* ${node.agent.source}\n` +
    `*Tools:* ${node.agent.tools.join(', ')}\n` +
    `*Model:* ${node.agent.model ?? '(default)'}`
  );
  item.description = node.agent.mode;
  return item;
}
