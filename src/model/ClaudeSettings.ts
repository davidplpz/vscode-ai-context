export type SettingsScope = 'global' | 'project';

export interface ClaudePermissions {
  defaultMode?: string;
  deny?: string[];
}

export interface ClaudeSettings {
  model?: string;
  agent?: string;
  permissions?: ClaudePermissions;
}

export interface ClaudeSettingsFile {
  scope: SettingsScope;
  path: string;
  settings: ClaudeSettings;
}
