"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeDir = homeDir;
/**
 * Get the user's home directory in a cross-platform way.
 * Does NOT import vscode — safe to use in standalone scripts.
 */
function homeDir() {
    return process.env.HOME || process.env.USERPROFILE || '/home';
}
//# sourceMappingURL=PathResolver.js.map