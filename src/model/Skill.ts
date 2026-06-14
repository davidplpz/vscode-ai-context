/**
 * Skill source — where the SKILL.md file lives.
 */
export type SkillSource = 'global' | 'project' | 'ecosystem' | 'user';

/**
 * A parsed AI Skill from a SKILL.md file.
 */
export interface Skill {
  /** Unique identifier, e.g. "go-testing" */
  name: string;

  /** Full description from frontmatter, includes trigger info */
  description: string;

  /** Trigger keywords extracted from the description */
  triggers: string[];

  /** License (e.g. "Apache-2.0") */
  license?: string;

  /** Semantic version */
  version?: string;

  /** Author */
  author?: string;

  /** Absolute path to the SKILL.md file */
  path: string;

  /** Where this skill was found */
  source: SkillSource;

  /** Allowed tools (if declared in frontmatter) */
  allowedTools?: string[];

  /** Markdown body content (after frontmatter) */
  body: string;
}

/**
 * Extract trigger keywords from a skill description.
 * Looks for "Trigger:" or "Trigger —" patterns.
 */
export function extractTriggers(description: string): string[] {
  const triggerMatch = description.match(/Trigger:\s*(.+?)(?:\.|$)/);
  if (!triggerMatch) return [];

  const text = triggerMatch[1];

  // Try to extract quoted values first — handles patterns like:
  //   Trigger: When user says "judgment day", "juzgar"
  //   → extracts ["judgment day", "juzgar"]
  const quoted: string[] = [];
  const quoteRegex = /"([^"]+)"/g;
  let qMatch: RegExpExecArray | null;
  while ((qMatch = quoteRegex.exec(text)) !== null) {
    quoted.push(qMatch[1]);
  }

  if (quoted.length > 0) return quoted;

  // Fall back to comma/semicolon separated values:
  //   Trigger: When writing tests, using teatest
  //   → ["When writing tests", "using teatest"]
  return text
    .split(/[,;]/)
    .map((t) => t.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean);
}

/**
 * Display name for a skill source.
 */
export function skillSourceLabel(source: SkillSource): string {
  const labels: Record<SkillSource, string> = {
    global: 'Global',
    project: 'Proyecto',
    ecosystem: 'Ecosistema',
    user: 'Usuario',
  };
  return labels[source];
}
