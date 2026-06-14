# AI Context — VS Code Extension

VS Code extension que descubre skills y agents de opencode y Claude Code en un TreeView en la Activity Bar.

## Commands

```bash
npm run compile        # tsc -p tsconfig.json → out/
npm test               # vitest run (46 tests)
npm run test:watch     # vitest --watch
vsce package           # genera .vsix (compila automático)
vsce publish           # publica al Marketplace
```

Single test file: `npx vitest run src/discovery/ConfigReader.test.ts`

## Debug

F5 en VS Code → Extension Development Host (preLaunchTask: `npm: compile`).

## Architecture

```
src/
├── extension.ts          # Entrypoint: activate(), registra comandos y views
├── model/
│   ├── Skill.ts          # Skill interface + extractTriggers() + skillSourceLabel()
│   ├── Agent.ts          # Agent interface + toAgentDetail()
├── discovery/
│   ├── SkillScanner.ts   # scanAllSkills(): 6 locations, "first wins" por nombre
│   ├── AgentResolver.ts  # resolveAllAgents(): global + project config
│   ├── ConfigReader.ts   # jsonc-parser para opencode.json(c)
│   ├── ProjectDetector.ts# detectProject(): workspace folder → context
│   ├── FileWatcher.ts    # Watcher proyecto-level con debounce 300ms
├── tree/
│   ├── TreeNode.ts       # Root | Category | Group | Skill | Agent nodes
│   ├── MainTreeProvider.ts# TreeDataProvider con refresh()
├── views/
│   ├── SkillDetailProvider.ts  # WebView con metadata + triggers + body HTML
├── search/
│   ├── QuickSearch.ts    # QuickPick con fuzzy match
├── utils/
│   ├── FrontmatterParser.ts    # Parser YAML minimal para SKILL.md
│   ├── MarkdownConverter.ts    # Markdown → HTML custom
│   ├── PathResolver.ts         # homeDir() cross-platform
```

**Skill scanning order** (primero gana en caso de nombre duplicado):
1. `~/.agents/skills/` → ecosystem
2. `~/.opencode/skills/` → user
3. `~/.config/opencode/skills/` → global
4. `~/.claude/skills/` → claude
5. `<project>/.opencode/skills/` → project
6. `<project>/.claude/skills/` → project

## Key Gotchas

### Packaging (critico)
- `node_modules/` NO debe estar en `.vscodeignore` — vsce se encarga de incluir solo production deps. Si se excluye, `jsonc-parser` no se incluye en el VSIX y `activate()` falla con "No registered data provider".
- El Marketplace icon va en `package.json` como `"icon": "media/icon-128.png"` — SVG de 24×24 no sirve, necesita PNG 128×128.

### FrontmatterParser
- `>` (folded block scalar) debe detectarse ANTES que nested objects, porque las líneas indentadas de continuación matchean el check de objetos anidados.
- Key regex usa `[\w.-]+` para soportar `metadata.author` (dot notation).
- `hasFrontmatter` solo checkea opening delimiter `---\n` — no valida que tenga cierre.

### extractTriggers
- Primero busca valores citados `"trigger"`, fallback a split por coma.
- No captura el prefijo "When user says" — solo extrae lo que está entre comillas.

### ConfigReader
- `jsonc-parser` retorna `{}` para contenido malformado como `{ invalid json }` en vez de `undefined`. Los tests lo contemplan.

### Tests
- Tests co-located con source (`src/**/*.test.ts`), 46 tests, todos unitarios.
- `globals: true` en vitest — no necesita imports de `describe/it/expect`.
- No hay tests de integración con VS Code API.

## Convenciones

- No linter configurado.
- No CI/CD configurado.
- No pre-commit hooks.
- Versions: `npm version patch --no-git-tag-version` + README update + `vsce package`.
- Commit messages: conventional commits, sin co-authored-by.
