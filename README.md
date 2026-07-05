# AI Context

Browse, search, and inspect [opencode](https://opencode.ai) and [Claude Code](https://docs.anthropic.com/en/docs/claude-code/) AI Skills and Agents directly from your VS Code editor.

## Features

### Activity Bar view

Discover all available AI Skills and Agents in a tree view organized by source and category:

- **Global Skills** — installed in `~/.config/opencode/skills/` or `~/.claude/skills/`
- **Project Skills** — local to your workspace (labeled by origin: OpenCode or Claude)
- **Ecosystem Skills** — from the opencode registry
- **User Skills** — custom user-defined skills
- **Claude Code Config** — view parsed `.claude/settings.json` (model, permissions, denied agents)
- **Agents** — configured in `opencode.json(c)`

### Rich Skill Details

Click any skill to open a WebView with:

- Metadata table (name, description, source, license)
- Trigger keywords (click to copy)
- Formatted markdown body with syntax-highlighted code blocks

### Quick Search

Press `Cmd+Shift+A` (or the search button in the view title bar) to fuzzy-search across all skills and agents.

### Context Menu

Right-click any skill to open the source file or copy its content.

## Requirements

- [opencode](https://opencode.ai) and/or [Claude Code](https://docs.anthropic.com/en/docs/claude-code/) installed and configured
- Skills discovered from global directories (`~/.config/opencode/skills/`, `~/.claude/skills/`, etc.) or your project's `.opencode/` / `.claude/` directories

## Extension Settings

This extension does not add any user-configurable settings yet.

## Known Issues

- Workspace-level file watching only monitors config files inside the project root
- Refresh is required after adding new global skills (auto-refresh is project-only)

## Release Notes

### 0.1.4

- Added: Project skills now show whether they come from OpenCode or Claude Code in the tree
- Added: Claude Code settings support — reads `.claude/settings.json` (global and project)
- Added: New "Config" category in the tree with detail WebView for Claude settings
- Added: `claude-code` keyword to package metadata

### 0.1.3

- Fixed: Marketplace icon now displays correctly (properly centered, visible colors)

### 0.1.2

- Added: Claude Code global skills discovery (`~/.claude/skills/`)
- Skills from Claude appear under a new "Claude" category in the tree

### 0.1.1

- Added Marketplace icon (128×128)
- Fixed: runtime dependency `jsonc-parser` now included in VSIX
- Fixed: `.vscodeignore` was incorrectly excluding `node_modules/`

### 0.1.0

Initial release:

- Activity Bar view with Skills & Agents tree
- Skill detail WebView with formatted markdown and metadata
- Quick Pick search across all skills and agents
- Right-click context menu (open file / copy content)
- Auto-refresh on project-level configuration changes

---

**Enjoying AI Context?** [Report issues](https://github.com/davidplpz/vscode-ai-context/issues) or contribute on GitHub.
