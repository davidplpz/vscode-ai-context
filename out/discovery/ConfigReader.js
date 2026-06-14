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
exports.readOpenCodeConfig = readOpenCodeConfig;
const fs = __importStar(require("fs"));
const jsonc_parser_1 = require("jsonc-parser");
/**
 * Read and parse an opencode.json or opencode.jsonc file.
 * Returns undefined if the file doesn't exist or can't be parsed.
 */
function readOpenCodeConfig(filePath) {
    if (!fs.existsSync(filePath))
        return undefined;
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const errors = [];
        const config = (0, jsonc_parser_1.parse)(content, errors);
        if (errors.length > 0) {
            console.warn(`[AI Context] JSONC parse errors in ${filePath}:`, errors.map((e) => `  line ${e.offset}: ${e.error}`));
        }
        return config ?? undefined;
    }
    catch (err) {
        console.error(`[AI Context] Failed to read ${filePath}:`, err);
        return undefined;
    }
}
//# sourceMappingURL=ConfigReader.js.map