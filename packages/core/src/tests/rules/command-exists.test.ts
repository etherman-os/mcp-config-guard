import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MCPConfig } from '../../types.js';

const { mockExecFile } = vi.hoisted(() => {
  return {
    mockExecFile: vi.fn((cmd: string, args: string[], _opts: any, callback: any) => {
      if (typeof _opts === 'function') {
        callback = _opts;
      }
      setTimeout(() => callback(null, { stdout: '', stderr: '' }), 0);
    }),
  };
});

vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    execFile: mockExecFile,
  };
});

import { commandExistsRule } from '../../rules/command-exists.js';

describe('command-exists rule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecFile.mockReset();
    mockExecFile.mockImplementation((cmd: string, args: string[], _opts: any, callback: any) => {
      if (typeof _opts === 'function') {
        callback = _opts;
      }
      setTimeout(() => callback(null, { stdout: '', stderr: '' }), 0);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should pass when command exists', async () => {
    const config: MCPConfig = {
      mcpServers: {
        filesystem: {
          command: 'node',
        },
      },
    };

    const diagnostics = await commandExistsRule.check(config);
    expect(diagnostics).toHaveLength(0);
    expect(mockExecFile).toHaveBeenCalledWith('which', ['node'], expect.any(Object), expect.any(Function));
  });

  it('should warn when command does not exist', async () => {
    mockExecFile.mockImplementation((cmd: string, args: string[], _opts: any, callback: any) => {
      if (typeof _opts === 'function') {
        callback = _opts;
      }
      setTimeout(() => callback(new Error('not found'), null), 0);
    });

    const config: MCPConfig = {
      mcpServers: {
        filesystem: {
          command: 'nonexistent-command-xyz',
        },
      },
    };

    const diagnostics = await commandExistsRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('command-exists');
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].message).toContain('nonexistent-command-xyz');
  });

  it('should skip servers without command', async () => {
    const config: MCPConfig = {
      mcpServers: {
        filesystem: {
          args: ['--help'],
        },
      },
    };

    const diagnostics = await commandExistsRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });

  it('should check multiple servers', async () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: {
          command: 'node',
        },
        server2: {
          command: 'python',
        },
      },
    };

    const diagnostics = await commandExistsRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });
});
