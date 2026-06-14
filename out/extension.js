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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const MainTreeProvider_1 = require("./tree/MainTreeProvider");
const QuickSearch_1 = require("./search/QuickSearch");
const SkillDetailProvider_1 = require("./views/SkillDetailProvider");
const FileWatcher_1 = require("./discovery/FileWatcher");
const ProjectDetector_1 = require("./discovery/ProjectDetector");
/**
 * Extract a Skill from either a direct Skill object or a SkillNode tree element.
 * Context menu commands receive the tree element (SkillNode), while left-click
 * via item.command receives the unwrapped Skill.
 */
function unwrapSkill(arg) {
    if (!arg)
        return undefined;
    if (typeof arg === 'object' && 'kind' in arg) {
        const node = arg;
        if (node.kind === 'skill' && node.skill)
            return node.skill;
    }
    if (typeof arg === 'object' && 'name' in arg) {
        return arg;
    }
    return undefined;
}
/**
 * Activate the extension — called by VS Code when activation events fire.
 */
function activate(context) {
    console.log('[AI Context] Activating...');
    // -----------------------------------------------------------------------
    // Initialize the tree data provider
    // -----------------------------------------------------------------------
    const treeProvider = new MainTreeProvider_1.MainTreeProvider();
    const treeView = vscode.window.createTreeView('vscodeAiContext.mainTree', {
        treeDataProvider: treeProvider,
        showCollapseAll: true,
    });
    context.subscriptions.push(treeView);
    // -----------------------------------------------------------------------
    // Initialize the skill detail webview provider
    // -----------------------------------------------------------------------
    const skillDetailProvider = new SkillDetailProvider_1.SkillDetailProvider();
    // -----------------------------------------------------------------------
    // Initialize file watcher for auto-refresh
    // -----------------------------------------------------------------------
    const project = (0, ProjectDetector_1.detectProject)();
    const fileWatcher = new FileWatcher_1.FileWatcher(() => {
        treeProvider.refresh();
        updateStatusBar();
    });
    fileWatcher.start(project?.rootPath);
    context.subscriptions.push({ dispose: () => fileWatcher.dispose() });
    // -----------------------------------------------------------------------
    // Register commands
    // -----------------------------------------------------------------------
    // Refresh command
    const refreshCmd = vscode.commands.registerCommand('vscodeAiContext.refresh', () => {
        treeProvider.refresh();
        updateStatusBar();
        vscode.window.showInformationMessage('[AI Context] Refreshed skills & agents');
    });
    context.subscriptions.push(refreshCmd);
    // Search command
    const searchCmd = vscode.commands.registerCommand('vscodeAiContext.searchSkills', () => (0, QuickSearch_1.showSearch)(treeProvider));
    context.subscriptions.push(searchCmd);
    // Show skill detail (WebView) — invoked by left-click on skill in tree
    const showSkillDetailCmd = vscode.commands.registerCommand('vscodeAiContext.showSkillDetail', (arg) => {
        const skill = unwrapSkill(arg);
        if (skill) {
            skillDetailProvider.show(skill);
        }
    });
    context.subscriptions.push(showSkillDetailCmd);
    // Open skill file in editor — invoked by context menu
    const openSkillCmd = vscode.commands.registerCommand('vscodeAiContext.openSkillFile', (arg) => {
        const skill = unwrapSkill(arg);
        if (skill) {
            (0, QuickSearch_1.openSkillFile)(skill);
            return;
        }
        (0, QuickSearch_1.showSearch)(treeProvider);
    });
    context.subscriptions.push(openSkillCmd);
    // Copy skill content to clipboard
    const copySkillCmd = vscode.commands.registerCommand('vscodeAiContext.copySkillContent', async (arg) => {
        const skill = unwrapSkill(arg);
        if (!skill) {
            vscode.window.showErrorMessage('[AI Context] No skill selected');
            return;
        }
        await vscode.env.clipboard.writeText(skill.body);
        vscode.window.showInformationMessage(`[AI Context] Copied "${skill.name}" content to clipboard`);
    });
    context.subscriptions.push(copySkillCmd);
    // -----------------------------------------------------------------------
    // Status bar
    // -----------------------------------------------------------------------
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'vscodeAiContext.searchSkills';
    statusBarItem.text = `$(light-bulb) ${treeProvider.getAllSkills().length} skills`;
    statusBarItem.tooltip = 'Click to search AI Skills & Agents';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    function updateStatusBar() {
        statusBarItem.text = `$(light-bulb) ${treeProvider.getAllSkills().length} skills`;
    }
    // Auto-refresh on workspace folder change
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        const newProject = (0, ProjectDetector_1.detectProject)();
        fileWatcher.start(newProject?.rootPath);
        treeProvider.refresh();
        updateStatusBar();
    }));
    console.log('[AI Context] Activated successfully');
}
/**
 * Deactivate — cleanup (handled by subscriptions).
 */
function deactivate() {
    // Cleanup handled by context.subscriptions disposal
}
//# sourceMappingURL=extension.js.map