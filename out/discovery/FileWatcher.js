"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcher = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Manages file system watchers for opencode config and SKILL.md files
 * within the workspace. Global skill directories cannot be watched
 * by VS Code's FileSystemWatcher (limited to workspace scope).
 *
 * For global changes, use the Refresh button in the view header.
 */
class FileWatcher {
    watchers = [];
    debounceTimer = null;
    onRefresh;
    debounceMs;
    currentRoot;
    constructor(onRefresh, debounceMs = 300) {
        this.onRefresh = onRefresh;
        this.debounceMs = debounceMs;
    }
    /**
     * Start watching workspace-level files.
     */
    start(projectRoot) {
        this.dispose();
        this.currentRoot = projectRoot;
        if (!projectRoot)
            return;
        // Watch opencode config in project root
        const configPattern = new vscode.RelativePattern(projectRoot, '{opencode.json,opencode.jsonc}');
        const configWatcher = vscode.workspace.createFileSystemWatcher(configPattern);
        configWatcher.onDidChange(() => this.scheduleRefresh());
        configWatcher.onDidCreate(() => this.scheduleRefresh());
        configWatcher.onDidDelete(() => this.scheduleRefresh());
        this.watchers.push(configWatcher);
        // Watch project-level skill directories
        for (const skillDir of ['.opencode/skills', '.claude/skills']) {
            const fullPath = path.join(projectRoot, skillDir);
            if (fs.existsSync(fullPath)) {
                const pattern = new vscode.RelativePattern(fullPath, '**/SKILL.md');
                const watcher = vscode.workspace.createFileSystemWatcher(pattern);
                watcher.onDidChange(() => this.scheduleRefresh());
                watcher.onDidCreate(() => this.scheduleRefresh());
                watcher.onDidDelete(() => this.scheduleRefresh());
                this.watchers.push(watcher);
            }
        }
        // Watch .vscode/settings.json for skill path changes
        const settingsPattern = new vscode.RelativePattern(path.join(projectRoot, '.vscode'), 'settings.json');
        const settingsWatcher = vscode.workspace.createFileSystemWatcher(settingsPattern);
        settingsWatcher.onDidChange(() => this.scheduleRefresh());
        this.watchers.push(settingsWatcher);
    }
    /**
     * Stop all watchers.
     */
    dispose() {
        for (const w of this.watchers) {
            w.dispose();
        }
        this.watchers = [];
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }
    scheduleRefresh() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null;
            this.onRefresh();
        }, this.debounceMs);
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=FileWatcher.js.map