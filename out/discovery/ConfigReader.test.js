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
const vitest_1 = require("vitest");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ConfigReader_1 = require("./ConfigReader");
(0, vitest_1.describe)('ConfigReader', () => {
    (0, vitest_1.it)('parses JSON without comments', () => {
        const dir = fs.mkdtempSync('test-config-');
        const filePath = path.join(dir, 'opencode.json');
        fs.writeFileSync(filePath, JSON.stringify({ agent: { test: { description: 'hello', mode: 'primary' } } }));
        const config = (0, ConfigReader_1.readOpenCodeConfig)(filePath);
        (0, vitest_1.expect)(config).toBeDefined();
        (0, vitest_1.expect)(config?.agent?.test.description).toBe('hello');
        fs.rmSync(dir, { recursive: true });
    });
    (0, vitest_1.it)('parses JSONC with comments', () => {
        const dir = fs.mkdtempSync('test-configc-');
        const filePath = path.join(dir, 'opencode.jsonc');
        fs.writeFileSync(filePath, [
            '{',
            '  // this is a comment',
            '  "agent": {',
            '    "test": {',
            '      "description": "with comments",',
            '      "mode": "subagent"',
            '    }',
            '  }',
            '}',
        ].join('\n'));
        const config = (0, ConfigReader_1.readOpenCodeConfig)(filePath);
        (0, vitest_1.expect)(config).toBeDefined();
        (0, vitest_1.expect)(config?.agent?.test.description).toBe('with comments');
        (0, vitest_1.expect)(config?.agent?.test.mode).toBe('subagent');
        fs.rmSync(dir, { recursive: true });
    });
    (0, vitest_1.it)('returns undefined for non-existent file', () => {
        const config = (0, ConfigReader_1.readOpenCodeConfig)('/nonexistent/path.json');
        (0, vitest_1.expect)(config).toBeUndefined();
    });
    (0, vitest_1.it)('returns empty object for malformed JSON (jsonc-parser is tolerant)', () => {
        const dir = fs.mkdtempSync('test-bad-');
        const filePath = path.join(dir, 'bad.json');
        fs.writeFileSync(filePath, '{ invalid json }');
        // jsonc-parser is tolerant and returns {} for unrecognizable content
        const config = (0, ConfigReader_1.readOpenCodeConfig)(filePath);
        (0, vitest_1.expect)(config).toEqual({});
        fs.rmSync(dir, { recursive: true });
    });
    (0, vitest_1.it)('returns undefined for empty file', () => {
        const dir = fs.mkdtempSync('test-empty-');
        const filePath = path.join(dir, 'empty.json');
        fs.writeFileSync(filePath, '');
        const config = (0, ConfigReader_1.readOpenCodeConfig)(filePath);
        (0, vitest_1.expect)(config).toBeUndefined();
        fs.rmSync(dir, { recursive: true });
    });
    (0, vitest_1.it)('parses trailing comma', () => {
        const dir = fs.mkdtempSync('test-trail-');
        const filePath = path.join(dir, 'trailing.json');
        fs.writeFileSync(filePath, [
            '{',
            '  "agent": { "test": { "description": "trailing" } },',
            '}',
        ].join('\n'));
        const config = (0, ConfigReader_1.readOpenCodeConfig)(filePath);
        (0, vitest_1.expect)(config).toBeDefined();
        (0, vitest_1.expect)(config?.agent?.test.description).toBe('trailing');
        fs.rmSync(dir, { recursive: true });
    });
});
//# sourceMappingURL=ConfigReader.test.js.map