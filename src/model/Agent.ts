/**
 * Agent mode from opencode config.
 */
export type AgentMode = 'primary' | 'subagent';

/**
 * A parsed AI Agent from opencode.json.
 */
export interface Agent {
  /** Agent name, e.g. "sdd-apply" */
  name: string;

  /** Short description */
  description: string;

  /** primary = main chat, subagent = delegated */
  mode: AgentMode;

  /** Model override (only for primary agents) */
  model?: string;

  /** Whether the agent is hidden from the agent list */
  hidden: boolean;

  /** Tool names this agent can use */
  tools: string[];

  /** The system prompt or a {file:...} reference */
  prompt: string;

  /** Where this agent was found */
  source: 'global' | 'project';
}

/**
 * Structured detail extracted from an agent for display.
 */
export interface AgentDetail {
  name: string;
  description: string;
  mode: AgentMode;
  model?: string;
  hidden: boolean;
  tools: string[];
  promptPreview: string;
}

/**
 * Create a display detail from an agent (truncates prompt).
 */
export function toAgentDetail(agent: Agent): AgentDetail {
  const maxPromptLen = 120;
  const promptPreview =
    agent.prompt.length > maxPromptLen
      ? agent.prompt.slice(0, maxPromptLen) + '...'
      : agent.prompt;

  return {
    name: agent.name,
    description: agent.description,
    mode: agent.mode,
    model: agent.model,
    hidden: agent.hidden,
    tools: agent.tools,
    promptPreview,
  };
}
