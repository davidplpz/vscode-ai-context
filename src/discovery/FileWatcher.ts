import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Manages file system watchers for opencode config and SKILL.md files
 * within the workspace. Global skill directories cannot be watched
 * by VS Code's FileSystemWatcher (limited to workspace scope).
 *
 * For global changes, use the Refresh button in the view header.
 */
export class FileWatcher {
  private watchers: vscode.FileSystemWatcher[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private onRefresh: () => void;
  private debounceMs: number;
  private currentRoot: string | undefined;

  constructor(onRefresh: () => void, debounceMs = 300) {
    this.onRefresh = onRefresh;
    this.debounceMs = debounceMs;
  }

  /**
   * Start watching workspace-level files.
   */
  start(projectRoot?: string): void {
    this.dispose();
    this.currentRoot = projectRoot;
    if (!projectRoot) return;

    // Watch opencode config in project root
    const configPattern = new vscode.RelativePattern(
      projectRoot,
      '{opencode.json,opencode.jsonc}'
    );
    const configWatcher = vscode.workspace.createFileSystemWatcher(configPattern);
    configWatcher.onDidChange(() => this.scheduleRefresh());
    configWatcher.onDidCreate(() => this.scheduleRefresh());
    configWatcher.onDidDelete(() => this.scheduleRefresh());
    this.watchers.push(configWatcher);

    // Watch project-level skill directories
    for (const skillDir of ['.opencode/skills', '.claude/skills']) {
      const fullPath = path.join(projectRoot, skillDir);
      if (fs.existsSync(fullPath)) {
        const pattern = new vscode.RelativePattern(fullPath, '**/SKILL.md');
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);
        watcher.onDidChange(() => this.scheduleRefresh());
        watcher.onDidCreate(() => this.scheduleRefresh());
        watcher.onDidDelete(() => this.scheduleRefresh());
        this.watchers.push(watcher);
      }
    }

    // Watch .vscode/settings.json for skill path changes
    const settingsPattern = new vscode.RelativePattern(
      path.join(projectRoot, '.vscode'),
      'settings.json'
    );
    const settingsWatcher = vscode.workspace.createFileSystemWatcher(settingsPattern);
    settingsWatcher.onDidChange(() => this.scheduleRefresh());
    this.watchers.push(settingsWatcher);
  }

  /**
   * Stop all watchers.
   */
  dispose(): void {
    for (const w of this.watchers) {
      w.dispose();
    }
    this.watchers = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private scheduleRefresh(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.onRefresh();
    }, this.debounceMs);
  }
}
