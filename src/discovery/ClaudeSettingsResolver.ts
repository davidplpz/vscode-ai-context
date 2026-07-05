import * as fs from 'fs';
import * as path from 'path';
import { ClaudeSettingsFile, SettingsScope } from '../model/ClaudeSettings';
import { homeDir } from '../utils/PathResolver';

export function resolveClaudeSettings(projectRoot?: string): ClaudeSettingsFile[] {
  const result: ClaudeSettingsFile[] = [];

  const global = readSettingsFile(path.join(homeDir(), '.claude', 'settings.json'), 'global');
  if (global) result.push(global);

  if (projectRoot) {
    const project = readSettingsFile(path.join(projectRoot, '.claude', 'settings.json'), 'project');
    if (project) result.push(project);
  }

  return result;
}

function readSettingsFile(filePath: string, scope: SettingsScope): ClaudeSettingsFile | undefined {
  if (!fs.existsSync(filePath)) return undefined;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const settings = JSON.parse(content);
    return { scope, path: filePath, settings };
  } catch {
    return undefined;
  }
}
