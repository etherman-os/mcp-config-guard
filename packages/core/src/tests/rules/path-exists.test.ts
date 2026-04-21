import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pathExistsRule } from '../../rules/path-exists.js';
import type { MCPConfig } from '../../types.js';
import fs from 'fs';
import path from 'path';

describe('path-exists rule', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
      const pathStr = p.toString();
      return pathStr === '/tmp' || pathStr.includes('/tmp');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should warn for non-existent absolute paths', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: ['/nonexistent/path'],
        },
      },
    };

    const diagnostics = pathExistsRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('path-exists');
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('should pass for existing paths', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: ['/tmp'],
        },
      },
    };

    const diagnostics = pathExistsRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });

  it('should ignore relative paths', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'npx',
          args: ['./relative/path', '../other/path'],
        },
      },
    };

    const diagnostics = pathExistsRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });
});
