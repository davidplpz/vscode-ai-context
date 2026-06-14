/**
 * Get the user's home directory in a cross-platform way.
 * Does NOT import vscode — safe to use in standalone scripts.
 */
export function homeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || '/home';
}
