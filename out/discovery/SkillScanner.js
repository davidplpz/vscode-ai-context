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
exports.scanAllSkills = scanAllSkills;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Skill_1 = require("../model/Skill");
const FrontmatterParser_1 = require("../utils/FrontmatterParser");
const PathResolver_1 = require("../utils/PathResolver");
/**
 * Scan all skill locations and return discovered skills.
 */
function scanAllSkills(projectRoot) {
    const skills = [];
    const home = (0, PathResolver_1.homeDir)();
    // Order matters: later sources override earlier ones by name.
    // This way project skills can shadow global ones.
    const locations = [
        // Ecosystem skills (from .agents)
        { dir: path.join(home, '.agents', 'skills'), source: 'ecosystem' },
        // User-level skills
        { dir: path.join(home, '.opencode', 'skills'), source: 'user' },
        // Global skills (from opencode config)
        { dir: path.join(home, '.config', 'opencode', 'skills'), source: 'global' },
        // Claude Code global skills
        { dir: path.join(home, '.claude', 'skills'), source: 'claude' },
    ];
    // Project-specific skills
    if (projectRoot) {
        locations.push({ dir: path.join(projectRoot, '.opencode', 'skills'), source: 'project' }, { dir: path.join(projectRoot, '.claude', 'skills'), source: 'project' });
    }
    const seen = new Set();
    for (const { dir, source } of locations) {
        if (!fs.existsSync(dir))
            continue;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const skillDir = path.join(dir, entry.name);
            const skillFile = path.join(skillDir, 'SKILL.md');
            if (!fs.existsSync(skillFile))
                continue;
            // If we already saw a skill with this name, skip (first wins)
            if (seen.has(entry.name))
                continue;
            seen.add(entry.name);
            const skill = parseSkillFile(skillFile, source);
            if (skill) {
                skills.push(skill);
            }
        }
    }
    return skills;
}
/**
 * Parse a single SKILL.md file into a Skill object.
 */
function parseSkillFile(filePath, source) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, body } = (0, FrontmatterParser_1.parseFrontmatter)(content);
        const name = frontmatter.name ?? path.basename(path.dirname(filePath));
        const description = frontmatter.description ?? '';
        const triggers = (0, Skill_1.extractTriggers)(description);
        // Handle both flat and nested metadata
        const metadata = frontmatter.metadata;
        return {
            name,
            description,
            triggers,
            license: frontmatter.license,
            version: metadata?.version,
            author: metadata?.author,
            path: filePath,
            source,
            allowedTools: parseAllowedTools(frontmatter['allowed-tools']),
            body,
        };
    }
    catch (err) {
        console.error(`[AI Context] Failed to parse skill ${filePath}:`, err);
        return undefined;
    }
}
function parseAllowedTools(raw) {
    if (!raw)
        return undefined;
    return raw.split(',').map((t) => t.trim()).filter(Boolean);
}
//# sourceMappingURL=SkillScanner.js.map