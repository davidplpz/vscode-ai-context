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
exports.resolveAllAgents = resolveAllAgents;
const path = __importStar(require("path"));
const ConfigReader_1 = require("./ConfigReader");
const PathResolver_1 = require("../utils/PathResolver");
/**
 * Resolve all agents from project and global configs.
 */
function resolveAllAgents(options = {}) {
    const agents = [];
    const seen = new Set();
    // Load global config (lowest priority)
    const globalConfigPath = path.join((0, PathResolver_1.homeDir)(), '.config', 'opencode', 'opencode.json');
    const globalConfig = (0, ConfigReader_1.readOpenCodeConfig)(globalConfigPath);
    if (globalConfig?.agent) {
        for (const [name, cfg] of Object.entries(globalConfig.agent)) {
            if (!options.includeHidden && cfg.hidden)
                continue;
            if (seen.has(name))
                continue;
            seen.add(name);
            agents.push(toAgent(name, cfg, 'global'));
        }
    }
    // Load project config (overrides global)
    if (options.projectConfigPath) {
        const projectConfig = (0, ConfigReader_1.readOpenCodeConfig)(options.projectConfigPath);
        if (projectConfig?.agent) {
            for (const [name, cfg] of Object.entries(projectConfig.agent)) {
                if (!options.includeHidden && cfg.hidden)
                    continue;
                // Project-level overwrites global
                const existingIndex = agents.findIndex((a) => a.name === name);
                const agent = toAgent(name, cfg, 'project');
                if (existingIndex >= 0) {
                    agents[existingIndex] = agent;
                }
                else {
                    agents.push(agent);
                }
            }
        }
    }
    return agents;
}
/**
 * Convert raw config to an Agent model.
 */
function toAgent(name, cfg, source) {
    return {
        name,
        description: cfg.description ?? '',
        mode: cfg.mode ?? 'subagent',
        model: cfg.model,
        hidden: cfg.hidden ?? false,
        tools: cfg.tools ? Object.keys(cfg.tools).filter((t) => cfg.tools[t] === true) : [],
        prompt: cfg.prompt ?? '',
        source,
    };
}
//# sourceMappingURL=AgentResolver.js.map