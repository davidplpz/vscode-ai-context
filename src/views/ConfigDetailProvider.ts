import * as vscode from 'vscode';
import { ClaudeSettingsFile } from '../model/ClaudeSettings';

export class ConfigDetailProvider {
  private panel: vscode.WebviewPanel | undefined;

  show(configFile: ClaudeSettingsFile): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
      this.updateContent(configFile);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'aiContext.configDetail',
        `Config: ${configFile.scope}`,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [],
        }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });

      this.panel.webview.onDidReceiveMessage((message) => {
        this.handleMessage(message);
      });

      this.updateContent(configFile);
    }
  }

  private updateContent(configFile: ClaudeSettingsFile): void {
    if (!this.panel) return;
    this.panel.title = `Claude Code — ${configFile.scope}`;
    this.panel.webview.html = this.getHtml(configFile);
  }

  private handleMessage(message: { command: string; path?: string }): void {
    switch (message.command) {
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

  private getHtml(configFile: ClaudeSettingsFile): string {
    const { settings, path, scope } = configFile;

    const metaRows = [
      { label: 'Scope', value: scope },
      { label: 'Path', value: path },
      ...(settings.model ? [{ label: 'Model', value: settings.model }] : []),
      ...(settings.agent ? [{ label: 'Default Agent', value: settings.agent }] : []),
      ...(settings.permissions?.defaultMode
        ? [{ label: 'Permission Mode', value: settings.permissions.defaultMode }]
        : []),
    ];

    const metaHtml = metaRows
      .map(
        (r) =>
          `<tr><td class="meta-label">${this.escapeHtml(r.label)}</td><td class="meta-value">${this.escapeHtml(r.value)}</td></tr>`
      )
      .join('');

    const denyList = settings.permissions?.deny;
    const denyHtml = denyList?.length
      ? `<div class="section">
          <div class="section-title">Denied Agents</div>
          <ul class="deny-list">
            ${denyList.map((a) => `<li class="deny-item">${this.escapeHtml(a)}</li>`).join('')}
          </ul>
        </div>`
      : '';

    const rawJson = JSON.stringify(settings, null, 2);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>Claude Code Settings — ${this.escapeHtml(scope)}</title>
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
      margin-bottom: 4px;
    }
    .header .subtitle {
      font-size: 13px;
      color: var(--vscode-descriptionForeground, #999);
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
      width: 140px;
      font-weight: 500;
      color: var(--vscode-descriptionForeground, #888);
      white-space: nowrap;
      vertical-align: top;
    }
    .meta-value {
      color: var(--vscode-editor-foreground, #ccc);
      word-break: break-all;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground, #888);
      margin-bottom: 8px;
    }
    .deny-list {
      padding-left: 20px;
    }
    .deny-item {
      font-size: 13px;
      margin: 4px 0;
      color: var(--vscode-editor-foreground, #ccc);
    }
    pre.raw {
      margin-top: 12px;
      padding: 12px 16px;
      background: var(--vscode-textCodeBlock-background, #2d2d2d);
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 12px;
      line-height: 1.5;
    }
    .toolbar {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--vscode-panel-border, #333);
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
  </style>
</head>
<body>
  <div class="header">
    <h1>Claude Code Settings</h1>
    <div class="subtitle">${this.escapeHtml(scope)} — ${this.escapeHtml(path)}</div>
  </div>

  <div class="metadata">
    <table>
      ${metaHtml}
    </table>
  </div>

  ${denyHtml}

  <div class="section">
    <div class="section-title">Raw Configuration</div>
    <pre class="raw">${this.escapeHtml(rawJson)}</pre>
  </div>

  <div class="toolbar">
    <button onclick="openFile()">📄 Open settings.json</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function openFile() {
      vscode.postMessage({ command: 'openFile', path: ${JSON.stringify(path)} });
    }
  </script>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
