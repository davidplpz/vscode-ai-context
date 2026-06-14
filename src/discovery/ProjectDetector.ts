import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface ProjectContext {
  /** Root path of the workspace folder */
  rootPath: string;

  /** Path to opencode.json or opencode.jsonc (if found) */
  configPath?: string;

  /** Whether the project has opencode config at all */
  hasOpenCode: boolean;
}

/**
 * Detect if the current workspace has opencode configuration.
 */
export function detectProject(): ProjectContext | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }

  // Use the first workspace folder
  const rootPath = workspaceFolders[0].uri.fsPath;

  // Look for opencode config files
  const configCandidates = [
    path.join(rootPath, 'opencode.json'),
    path.join(rootPath, 'opencode.jsonc'),
  ];

  for (const candidate of configCandidates) {
    if (fs.existsSync(candidate)) {
      return {
        rootPath,
        configPath: candidate,
        hasOpenCode: true,
      };
    }
  }

  // Also check for .opencode directory
  const dotOpenCode = path.join(rootPath, '.opencode');
  if (fs.existsSync(dotOpenCode)) {
    return {
      rootPath,
      hasOpenCode: true,
    };
  }

  return {
    rootPath,
    hasOpenCode: false,
  };
}


