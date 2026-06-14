import * as vscode from 'vscode';
import { MainTreeProvider } from './tree/MainTreeProvider';
import { showSearch, openSkillFile } from './search/QuickSearch';
import { Skill } from './model/Skill';
import { SkillDetailProvider } from './views/SkillDetailProvider';
import { FileWatcher } from './discovery/FileWatcher';
import { detectProject } from './discovery/ProjectDetector';

/**
 * Extract a Skill from either a direct Skill object or a SkillNode tree element.
 * Context menu commands receive the tree element (SkillNode), while left-click
 * via item.command receives the unwrapped Skill.
 */
function unwrapSkill(arg: unknown): Skill | undefined {
  if (!arg) return undefined;
  if (typeof arg === 'object' && 'kind' in (arg as Record<string, unknown>)) {
    const node = arg as { kind: string; skill?: Skill };
    if (node.kind === 'skill' && node.skill) return node.skill;
  }
  if (typeof arg === 'object' && 'name' in (arg as Record<string, unknown>)) {
    return arg as Skill;
  }
  return undefined;
}

/**
 * Activate the extension — called by VS Code when activation events fire.
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('[AI Context] Activating...');

  // -----------------------------------------------------------------------
  // Initialize the tree data provider
  // -----------------------------------------------------------------------
  const treeProvider = new MainTreeProvider();
  const treeView = vscode.window.createTreeView('vscodeAiContext.mainTree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  // -----------------------------------------------------------------------
  // Initialize the skill detail webview provider
  // -----------------------------------------------------------------------
  const skillDetailProvider = new SkillDetailProvider();

  // -----------------------------------------------------------------------
  // Initialize file watcher for auto-refresh
  // -----------------------------------------------------------------------
  const project = detectProject();
  const fileWatcher = new FileWatcher(() => {
    treeProvider.refresh();
    updateStatusBar();
  });
  fileWatcher.start(project?.rootPath);
  context.subscriptions.push({ dispose: () => fileWatcher.dispose() });

  // -----------------------------------------------------------------------
  // Register commands
  // -----------------------------------------------------------------------

  // Refresh command
  const refreshCmd = vscode.commands.registerCommand(
    'vscodeAiContext.refresh',
    () => {
      treeProvider.refresh();
      updateStatusBar();
      vscode.window.showInformationMessage('[AI Context] Refreshed skills & agents');
    }
  );
  context.subscriptions.push(refreshCmd);

  // Search command
  const searchCmd = vscode.commands.registerCommand(
    'vscodeAiContext.searchSkills',
    () => showSearch(treeProvider)
  );
  context.subscriptions.push(searchCmd);

  // Show skill detail (WebView) — invoked by left-click on skill in tree
  const showSkillDetailCmd = vscode.commands.registerCommand(
    'vscodeAiContext.showSkillDetail',
    (arg?: unknown) => {
      const skill = unwrapSkill(arg);
      if (skill) {
        skillDetailProvider.show(skill);
      }
    }
  );
  context.subscriptions.push(showSkillDetailCmd);

  // Open skill file in editor — invoked by context menu
  const openSkillCmd = vscode.commands.registerCommand(
    'vscodeAiContext.openSkillFile',
    (arg?: unknown) => {
      const skill = unwrapSkill(arg);
      if (skill) {
        openSkillFile(skill);
        return;
      }
      showSearch(treeProvider);
    }
  );
  context.subscriptions.push(openSkillCmd);

  // Copy skill content to clipboard
  const copySkillCmd = vscode.commands.registerCommand(
    'vscodeAiContext.copySkillContent',
    async (arg?: unknown) => {
      const skill = unwrapSkill(arg);
      if (!skill) {
        vscode.window.showErrorMessage('[AI Context] No skill selected');
        return;
      }
      await vscode.env.clipboard.writeText(skill.body);
      vscode.window.showInformationMessage(
        `[AI Context] Copied "${skill.name}" content to clipboard`
      );
    }
  );
  context.subscriptions.push(copySkillCmd);

  // -----------------------------------------------------------------------
  // Status bar
  // -----------------------------------------------------------------------
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'vscodeAiContext.searchSkills';
  statusBarItem.text = `$(light-bulb) ${treeProvider.getAllSkills().length} skills`;
  statusBarItem.tooltip = 'Click to search AI Skills & Agents';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  function updateStatusBar(): void {
    statusBarItem.text = `$(light-bulb) ${treeProvider.getAllSkills().length} skills`;
  }

  // Auto-refresh on workspace folder change
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      const newProject = detectProject();
      fileWatcher.start(newProject?.rootPath);
      treeProvider.refresh();
      updateStatusBar();
    })
  );

  console.log('[AI Context] Activated successfully');
}

/**
 * Deactivate — cleanup (handled by subscriptions).
 */
export function deactivate(): void {
  // Cleanup handled by context.subscriptions disposal
}
