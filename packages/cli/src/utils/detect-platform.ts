import os from 'os';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import json5 from 'json5';

export function getHomeDir(): string {
  return os.homedir();
}

export function isMcpConfigFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8').trim();
    if (!content) return false;
    const json = json5.parse(content);
    return typeof json === 'object' && json !== null && 'mcpServers' in json;
  } catch {
    return false;
  }
}

export function detectPlatformConfigPath(platform: string): string | null {
  const home = getHomeDir();
  const cwd = process.cwd();

  switch (platform) {
    case 'claude': {
      if (process.platform === 'darwin') {
        return path.join(home, 'Library/Application Support/Claude/claude_desktop_config.json');
      }
      if (process.platform === 'win32') {
        return path.join(process.env.APPDATA || home, 'Claude', 'claude_desktop_config.json');
      }
      return path.join(home, '.config/Claude/claude_desktop_config.json');
    }
    case 'cursor': {
      if (process.platform === 'darwin') {
        const macPath = path.join(home, 'Library/Application Support/Cursor/mcp.json');
        if (existsSync(macPath)) return macPath;
        return path.join(home, '.cursor/mcp.json');
      }
      if (process.platform === 'win32') {
        return path.join(process.env.APPDATA || home, 'Cursor', 'mcp.json');
      }
      return path.join(home, '.cursor/mcp.json');
    }
    case 'claude-code': {
      const globalPath = path.join(home, '.claude/mcp.json');
      if (existsSync(globalPath)) return globalPath;
      const projectPath = path.join(cwd, '.mcp.json');
      if (existsSync(projectPath)) return projectPath;
      return globalPath;
    }
    default:
      return null;
  }
}

export function detectDefaultConfigPath(): string | null {
  const claudePath = detectPlatformConfigPath('claude');
  if (claudePath && existsSync(claudePath) && isMcpConfigFile(claudePath)) {
    return claudePath;
  }

  const cursorPath = detectPlatformConfigPath('cursor');
  if (cursorPath && existsSync(cursorPath) && isMcpConfigFile(cursorPath)) {
    return cursorPath;
  }

  const claudeCodePath = detectPlatformConfigPath('claude-code');
  if (claudeCodePath && existsSync(claudeCodePath) && isMcpConfigFile(claudeCodePath)) {
    return claudeCodePath;
  }

  return null;
}