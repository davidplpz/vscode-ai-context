import * as path from 'path';
import { Agent, AgentMode } from '../model/Agent';
import { readOpenCodeConfig, AgentConfig } from './ConfigReader';
import { homeDir } from '../utils/PathResolver';

interface ResolveOptions {
  /** Project config path (opencode.json/jsonc) */
  projectConfigPath?: string;

  /** Whether to include hidden agents */
  includeHidden?: boolean;
}

/**
 * Resolve all agents from project and global configs.
 */
export function resolveAllAgents(
  options: ResolveOptions = {}
): Agent[] {
  const agents: Agent[] = [];
  const seen = new Set<string>();

  // Load global config (lowest priority)
  const globalConfigPath = path.join(
    homeDir(),
    '.config',
    'opencode',
    'opencode.json'
  );
  const globalConfig = readOpenCodeConfig(globalConfigPath);
  if (globalConfig?.agent) {
    for (const [name, cfg] of Object.entries(globalConfig.agent)) {
      if (!options.includeHidden && cfg.hidden) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      agents.push(toAgent(name, cfg, 'global'));
    }
  }

  // Load project config (overrides global)
  if (options.projectConfigPath) {
    const projectConfig = readOpenCodeConfig(options.projectConfigPath);
    if (projectConfig?.agent) {
      for (const [name, cfg] of Object.entries(projectConfig.agent)) {
        if (!options.includeHidden && cfg.hidden) continue;
        // Project-level overwrites global
        const existingIndex = agents.findIndex((a) => a.name === name);
        const agent = toAgent(name, cfg, 'project');
        if (existingIndex >= 0) {
          agents[existingIndex] = agent;
        } else {
          agents.push(agent);
        }
      }
    }
  }

  return agents;
}

/**
 * Convert raw config to an Agent model.
 */
function toAgent(name: string, cfg: AgentConfig, source: 'global' | 'project'): Agent {
  return {
    name,
    description: cfg.description ?? '',
    mode: (cfg.mode as AgentMode) ?? 'subagent',
    model: cfg.model,
    hidden: cfg.hidden ?? false,
    tools: cfg.tools ? Object.keys(cfg.tools).filter((t) => cfg.tools![t] === true) : [],
    prompt: cfg.prompt ?? '',
    source,
  };
}
