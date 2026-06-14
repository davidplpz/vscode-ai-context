import * as fs from 'fs';
import { parse, ParseError } from 'jsonc-parser';

export interface OpenCodeConfig {
  /** Agent definitions — opencode.json uses 'agent' (singular) */
  agent?: Record<string, AgentConfig>;
}

export interface AgentConfig {
  description?: string;
  hidden?: boolean;
  mode?: string;
  model?: string;
  prompt?: string;
  tools?: Record<string, boolean | string>;
  permission?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Read and parse an opencode.json or opencode.jsonc file.
 * Returns undefined if the file doesn't exist or can't be parsed.
 */
export function readOpenCodeConfig(filePath: string): OpenCodeConfig | undefined {
  if (!fs.existsSync(filePath)) return undefined;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors: ParseError[] = [];
    const config = parse(content, errors) as OpenCodeConfig | undefined;

    if (errors.length > 0) {
      console.warn(
        `[AI Context] JSONC parse errors in ${filePath}:`,
        errors.map((e) => `  line ${e.offset}: ${e.error}`)
      );
    }

    return config ?? undefined;
  } catch (err) {
    console.error(`[AI Context] Failed to read ${filePath}:`, err);
    return undefined;
  }
}
