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
exports.SkillDetailProvider = void 0;
const vscode = __importStar(require("vscode"));
const Skill_1 = require("../model/Skill");
const MarkdownConverter_1 = require("../utils/MarkdownConverter");
/**
 * Manages a WebView panel that shows detailed skill information.
 */
class SkillDetailProvider {
    panel;
    currentSkill;
    /**
     * Show (or reveal) the skill detail panel.
     */
    show(skill) {
        this.currentSkill = skill;
        if (this.panel) {
            // Reveal existing panel
            this.panel.reveal(vscode.ViewColumn.Beside);
            this.updateContent();
        }
        else {
            // Create new panel
            this.panel = vscode.window.createWebviewPanel('aiContext.skillDetail', `Skill: ${skill.name}`, vscode.ViewColumn.Beside, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [],
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.currentSkill = undefined;
            });
            // Handle messages from the WebView
            this.panel.webview.onDidReceiveMessage((message) => {
                this.handleMessage(message);
            });
            this.updateContent();
        }
    }
    /**
     * Update or set the HTML content.
     */
    updateContent() {
        if (!this.panel || !this.currentSkill)
            return;
        this.panel.title = `Skill: ${this.currentSkill.name}`;
        this.panel.webview.html = this.getHtml(this.currentSkill);
    }
    /**
     * Handle messages from the WebView (clipboard copy).
     */
    handleMessage(message) {
        switch (message.command) {
            case 'copyToClipboard':
                if (message.text) {
                    vscode.env.clipboard.writeText(message.text);
                    vscode.window.showInformationMessage('[AI Context] Copied to clipboard');
                }
                break;
            case 'openFile':
                if (message.path) {
                    const uri = vscode.Uri.file(message.path);
                    vscode.workspace.openTextDocument(uri).then((doc) => {
                        vscode.window.showTextDocument(doc, { preview: true });
                    });
                }
                break;
        }
    }
    /**
     * Generate the full HTML for the skill detail page.
     */
    getHtml(skill) {
        const bodyHtml = (0, MarkdownConverter_1.markdownToHtml)(skill.body);
        const triggersHtml = skill.triggers
            .map((t) => `<button class="trigger-tag" onclick="copyText('${this.escapeJs(t)}')" title="Click to copy">${this.escapeHtml(t)}</button>`)
            .join('');
        const metaRows = [
            { label: 'Source', value: (0, Skill_1.skillSourceLabel)(skill.source) },
            ...(skill.version ? [{ label: 'Version', value: skill.version }] : []),
            ...(skill.author ? [{ label: 'Author', value: skill.author }] : []),
            ...(skill.license ? [{ label: 'License', value: skill.license }] : []),
            ...(skill.allowedTools
                ? [{ label: 'Tools', value: skill.allowedTools.join(', ') }]
                : []),
            { label: 'Path', value: skill.path },
        ];
        const metaHtml = metaRows
            .map((r) => `<tr><td class="meta-label">${this.escapeHtml(r.label)}</td><td class="meta-value">${this.escapeHtml(r.value)}</td></tr>`)
            .join('');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>${this.escapeHtml(skill.name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: var(--vscode-editor-foreground, #ccc);
      background: var(--vscode-editor-background, #1e1e1e);
      padding: 24px 32px;
    }

    .header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-panel-border, #333);
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--vscode-editor-foreground, #ccc);
    }
    .header .description {
      font-size: 14px;
      color: var(--vscode-descriptionForeground, #999);
      line-height: 1.5;
    }

    .triggers {
      margin-bottom: 16px;
    }
    .triggers-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground, #888);
      margin-bottom: 6px;
    }
    .trigger-tag {
      display: inline-block;
      margin: 2px 4px 2px 0;
      padding: 3px 10px;
      font-size: 12px;
      background: var(--vscode-badge-background, #4a4a4a);
      color: var(--vscode-badge-foreground, #fff);
      border: 1px solid var(--vscode-badge-background, #4a4a4a);
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .trigger-tag:hover {
      opacity: 0.8;
    }
    .trigger-tag:active {
      opacity: 0.6;
    }
    .trigger-tag::after {
      content: ' \\1F4CB';
      font-size: 11px;
      margin-left: 4px;
      opacity: 0.6;
    }

    .metadata {
      margin-bottom: 24px;
    }
    .metadata table {
      width: 100%;
      border-collapse: collapse;
    }
    .metadata td {
      padding: 4px 8px;
      font-size: 13px;
      border-bottom: 1px solid var(--vscode-panel-border, #2a2a2a);
    }
    .meta-label {
      width: 80px;
      font-weight: 500;
      color: var(--vscode-descriptionForeground, #888);
      white-space: nowrap;
      vertical-align: top;
    }
    .meta-value {
      color: var(--vscode-editor-foreground, #ccc);
      word-break: break-all;
    }

    .skill-body {
      margin-top: 8px;
    }
    .skill-body h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--vscode-panel-border, #333);
    }
    .skill-body h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 20px 0 8px;
    }
    .skill-body h4 {
      font-size: 14px;
      font-weight: 600;
      margin: 16px 0 6px;
    }
    .skill-body p {
      margin: 8px 0;
    }
    .skill-body ul {
      margin: 8px 0;
      padding-left: 24px;
    }
    .skill-body li {
      margin: 3px 0;
    }
    .skill-body code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 13px;
      background: var(--vscode-textCodeBlock-background, #2d2d2d);
      padding: 1px 6px;
      border-radius: 3px;
    }
    .skill-body pre {
      margin: 12px 0;
      padding: 12px 16px;
      background: var(--vscode-textCodeBlock-background, #2d2d2d);
      border-radius: 6px;
      overflow-x: auto;
    }
    .skill-body pre code {
      background: none;
      padding: 0;
      font-size: 13px;
      line-height: 1.5;
    }
    .skill-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 13px;
    }
    .skill-body th {
      background: var(--vscode-editor-lineHighlightBackground, #2a2d2e);
      font-weight: 600;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid var(--vscode-panel-border, #333);
    }
    .skill-body td {
      padding: 6px 10px;
      border: 1px solid var(--vscode-panel-border, #333);
    }
    .skill-body hr {
      margin: 20px 0;
      border: none;
      border-top: 1px solid var(--vscode-panel-border, #333);
    }
    .skill-body a {
      color: var(--vscode-textLink-foreground, #4fc1ff);
      text-decoration: none;
    }
    .skill-body a:hover {
      text-decoration: underline;
    }
    .skill-body img {
      max-width: 100%;
      border-radius: 4px;
    }
    .skill-body strong {
      font-weight: 600;
    }

    .toolbar {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--vscode-panel-border, #333);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .toolbar button {
      padding: 6px 14px;
      font-size: 13px;
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #fff);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .toolbar button:hover {
      background: var(--vscode-button-hoverBackground, #1177bb);
    }
    .toolbar button.secondary {
      background: var(--vscode-button-secondaryBackground, #3a3d41);
    }
    .toolbar button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground, #4a4d51);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHtml(skill.name)}</h1>
    <div class="description">${this.escapeHtml(skill.description)}</div>
  </div>

  ${skill.triggers.length > 0
            ? `<div class="triggers">
        <div class="triggers-label">Triggers (click to copy)</div>
        ${triggersHtml}
      </div>`
            : ''}

  <div class="metadata">
    <table>
      ${metaHtml}
    </table>
  </div>

  ${bodyHtml}

  <div class="toolbar">
    <button onclick="copyFullBody()">📋 Copy Full Content</button>
    <button class="secondary" onclick="copyTriggersOnly()">🎯 Copy Triggers Only</button>
    <button class="secondary" onclick="openFile()">📄 Open SKILL.md</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function copyText(text) {
      vscode.postMessage({ command: 'copyToClipboard', text: text });
    }

    function copyFullBody() {
      const body = ${JSON.stringify(skill.body)};
      vscode.postMessage({ command: 'copyToClipboard', text: body });
    }

    function copyTriggersOnly() {
      const triggers = ${JSON.stringify(skill.triggers)};
      vscode.postMessage({ command: 'copyToClipboard', text: triggers.join(', ') });
    }

    function openFile() {
      vscode.postMessage({ command: 'openFile', path: ${JSON.stringify(skill.path)} });
    }
  </script>
</body>
</html>`;
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    escapeJs(text) {
        return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
}
exports.SkillDetailProvider = SkillDetailProvider;
//# sourceMappingURL=SkillDetailProvider.js.map