import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Diagnostic, MCPConfig, Rule } from '../types.js';

function expandHome(filepath: string): string {
  if (filepath.startsWith('~/') || filepath === '~') {
    return filepath.replace('~', os.homedir());
  }
  return filepath;
}

function isAbsolutePath(p: string): boolean {
  return /^\//.test(p) || /^[A-Z]:\\/i.test(p) || p.startsWith('~/') || p === '~';
}

function extractPaths(args: string[]): string[] {
  return args.filter((arg) => isAbsolutePath(arg));
}

export const pathExistsRule: Rule = {
  id: 'path-exists',
  description: 'Checks if paths in args actually exist on the filesystem',
  severity: 'warning',
  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    for (const [name, server] of Object.entries(mcpServers)) {
      if (!Array.isArray(server.args)) continue;
      const paths = extractPaths(server.args);
      for (const p of paths) {
        const expanded = expandHome(p);
        try {
          if (!fs.existsSync(expanded)) {
            diagnostics.push({
              ruleId: 'path-exists',
              severity: 'warning',
              message: `Specified path not found: ${p}`,
              path: `mcpServers.${name}.args`,
            });
          }
        } catch {
          diagnostics.push({
            ruleId: 'path-exists',
            severity: 'warning',
            message: `Could not check path: ${p}`,
            path: `mcpServers.${name}.args`,
          });
        }
      }
    }

    return diagnostics;
  },
};
