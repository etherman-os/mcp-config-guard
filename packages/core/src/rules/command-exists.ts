import { execFile } from 'child_process';
import { promisify } from 'util';
import type { Diagnostic, MCPConfig, Rule } from '../types.js';

const execFileAsync = promisify(execFile);

const commandCache = new Map<string, boolean>();

async function commandExists(cmd: string): Promise<boolean> {
  if (commandCache.has(cmd)) return commandCache.get(cmd)!;
  try {
    const shellCmd = process.platform === 'win32' ? 'where' : 'which';
    await execFileAsync(shellCmd, [cmd], { timeout: 5000 });
    commandCache.set(cmd, true);
    return true;
  } catch {
    commandCache.set(cmd, false);
    return false;
  }
}

export const commandExistsRule: Rule = {
  id: 'command-exists',
  description: 'Checks if the command executable exists on the system',
  severity: 'warning',
  async check(config: MCPConfig): Promise<Diagnostic[]> {
    const { mcpServers } = config;

    const checks = await Promise.all(
      Object.entries(mcpServers).map(async ([name, server]) => {
        if (typeof server.command !== 'string' || !server.command) return [];
        const exists = await commandExists(server.command);
        if (!exists) {
          return [{
            ruleId: 'command-exists' as const,
            severity: 'warning' as const,
            message: `Command not found: ${server.command}. It must be in PATH or a full path must be provided.`,
            path: `mcpServers.${name}.command`,
          }];
        }
        return [];
      })
    );

    return checks.flat();
  },
};
