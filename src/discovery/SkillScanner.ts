import * as fs from 'fs';
import * as path from 'path';
import { Skill, SkillSource, extractTriggers } from '../model/Skill';
import {
  parseFrontmatter,
} from '../utils/FrontmatterParser';
import { homeDir } from '../utils/PathResolver';

/**
 * Scan all skill locations and return discovered skills.
 */
export function scanAllSkills(projectRoot?: string): Skill[] {
  const skills: Skill[] = [];
  const home = homeDir();

  // Order matters: later sources override earlier ones by name.
  // This way project skills can shadow global ones.
  const locations: { dir: string; source: SkillSource }[] = [
    // Ecosystem skills (from .agents)
    { dir: path.join(home, '.agents', 'skills'), source: 'ecosystem' },
    // User-level skills
    { dir: path.join(home, '.opencode', 'skills'), source: 'user' },
    // Global skills (from opencode config)
    { dir: path.join(home, '.config', 'opencode', 'skills'), source: 'global' },
  ];

  // Project-specific skills
  if (projectRoot) {
    locations.push(
      { dir: path.join(projectRoot, '.opencode', 'skills'), source: 'project' },
      { dir: path.join(projectRoot, '.claude', 'skills'), source: 'project' }
    );
  }

  const seen = new Set<string>();

  for (const { dir, source } of locations) {
    if (!fs.existsSync(dir)) continue;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillDir = path.join(dir, entry.name);
      const skillFile = path.join(skillDir, 'SKILL.md');

      if (!fs.existsSync(skillFile)) continue;

      // If we already saw a skill with this name, skip (first wins)
      if (seen.has(entry.name)) continue;
      seen.add(entry.name);

      const skill = parseSkillFile(skillFile, source);
      if (skill) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

/**
 * Parse a single SKILL.md file into a Skill object.
 */
function parseSkillFile(filePath: string, source: SkillSource): Skill | undefined {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    const name = (frontmatter.name as string) ?? path.basename(path.dirname(filePath));
    const description = (frontmatter.description as string) ?? '';
    const triggers = extractTriggers(description);

    // Handle both flat and nested metadata
    const metadata = frontmatter.metadata as Record<string, unknown> | undefined;

    return {
      name,
      description,
      triggers,
      license: frontmatter.license as string | undefined,
      version: metadata?.version as string | undefined,
      author: metadata?.author as string | undefined,
      path: filePath,
      source,
      allowedTools: parseAllowedTools(frontmatter['allowed-tools'] as string | undefined),
      body,
    };
  } catch (err) {
    console.error(`[AI Context] Failed to parse skill ${filePath}:`, err);
    return undefined;
  }
}

function parseAllowedTools(raw?: string): string[] | undefined {
  if (!raw) return undefined;
  return raw.split(',').map((t) => t.trim()).filter(Boolean);
}
