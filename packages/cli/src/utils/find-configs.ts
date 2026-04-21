import { existsSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { isMcpConfigFile } from './detect-platform.js';

export interface ConfigFile {
  name: string;
  path: string;
  os: string;
}

export function findAvailableConfigs(): ConfigFile[] {
  const home = homedir();
  const cwd = process.cwd();

  const candidates: (ConfigFile | null)[] = [
    {
      name: 'Claude Desktop (macOS)',
      path: path.join(home, 'Library/Application Support/Claude/claude_desktop_config.json'),
      os: 'darwin',
    },
    {
      name: 'Claude Desktop (Linux)',
      path: path.join(home, '.config/Claude/claude_desktop_config.json'),
      os: 'linux',
    },
    process.env.APPDATA
      ? {
          name: 'Claude Desktop (Windows)',
          path: path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json'),
          os: 'win32',
        }
      : null,
    {
      name: 'Cursor (Global)',
      path: path.join(home, '.cursor/mcp.json'),
      os: 'any',
    },
    process.platform === 'darwin'
      ? {
          name: 'Cursor (Global, macOS)',
          path: path.join(home, 'Library/Application Support/Cursor/mcp.json'),
          os: 'darwin',
        }
      : null,
    process.env.APPDATA
      ? {
          name: 'Cursor (Global, Windows)',
          path: path.join(process.env.APPDATA, 'Cursor', 'mcp.json'),
          os: 'win32',
        }
      : null,
    {
      name: 'Cursor (Project)',
      path: path.join(cwd, '.cursor/mcp.json'),
      os: 'any',
    },
    {
      name: 'Claude Code (Global)',
      path: path.join(home, '.claude/mcp.json'),
      os: 'any',
    },
    {
      name: 'Claude Code (Project)',
      path: path.join(cwd, '.mcp.json'),
      os: 'any',
    },
  ];

  const allConfigs = candidates.filter((c): c is ConfigFile => c !== null && existsSync(c.path));

  const uniquePaths = new Map<string, ConfigFile>();
  for (const config of allConfigs) {
    if (!uniquePaths.has(config.path)) {
      uniquePaths.set(config.path, config);
    }
  }

  return Array.from(uniquePaths.values()).filter((c) => isMcpConfigFile(c.path));
}

export function getConfigDisplayName(config: ConfigFile): string {
  return `${config.name} — ${config.path}`;
}
