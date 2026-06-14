import * as vscode from 'vscode';
import { Skill } from '../model/Skill';
import { Agent, toAgentDetail } from '../model/Agent';
import { MainTreeProvider } from '../tree/MainTreeProvider';

/**
 * Open a QuickPick to search across skills and agents.
 */
export async function showSearch(treeProvider: MainTreeProvider): Promise<void> {
  const skills = treeProvider.getAllSkills();
  const agents = treeProvider.getAllAgents();

  // Build quick pick items
  const skillItems: vscode.QuickPickItem[] = skills.map((skill) => ({
    label: `$(code) ${skill.name}`,
    description: skill.source,
    detail: skill.description.slice(0, 120),
    // Store skill name so we can look it up later
  }));

  const agentItems: vscode.QuickPickItem[] = agents.map((agent) => {
    const detail = toAgentDetail(agent);
    return {
      label: `$(person) ${agent.name}`,
      description: agent.mode,
      detail: detail.description,
    };
  });

  // Create separator items
  const allItems: (vscode.QuickPickItem & { __type?: 'skill' | 'agent'; __name?: string })[] = [
    ...(skillItems.length > 0
      ? [{ label: 'Skills', kind: vscode.QuickPickItemKind.Separator } as any, ...skillItems]
      : []),
    ...(agentItems.length > 0
      ? [{ label: 'Agents', kind: vscode.QuickPickItemKind.Separator } as any, ...agentItems]
      : []),
  ];

  // Attach type info
  const mappedItems = allItems.map((item) => {
    const skill = skills.find((s) => `$(code) ${s.name}` === item.label);
    if (skill) {
      return { ...item, __type: 'skill' as const, __name: skill.name };
    }
    const agent = agents.find((a) => `$(person) ${a.name}` === item.label);
    if (agent) {
      return { ...item, __type: 'agent' as const, __name: agent.name };
    }
    return { ...item };
  });

  const pick = await vscode.window.showQuickPick(mappedItems, {
    placeHolder: 'Search skills and agents by name or description...',
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!pick) return;

  if (pick.__type === 'skill') {
    const skill = skills.find((s) => s.name === pick.__name);
    if (skill) {
      vscode.commands.executeCommand('vscodeAiContext.showSkillDetail', skill);
    }
  } else if (pick.__type === 'agent') {
    const agent = agents.find((a) => a.name === pick.__name);
    if (agent) {
      showAgentDetail(agent);
    }
  }
}

/**
 * Open a skill's SKILL.md file in the editor.
 */
export function openSkillFile(skill: Skill): void {
  const uri = vscode.Uri.file(skill.path);
  vscode.workspace.openTextDocument(uri).then((doc) => {
    vscode.window.showTextDocument(doc, { preview: true });
  });
}

/**
 * Show agent detail in an information message.
 */
export function showAgentDetail(agent: Agent): void {
  const detail = toAgentDetail(agent);
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
