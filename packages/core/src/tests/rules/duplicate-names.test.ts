import { describe, it, expect } from 'vitest';
import { duplicateNamesRule } from '../../rules/duplicate-names.js';
import type { MCPConfig } from '../../types.js';

describe('duplicate-names rule', () => {
  it('should warn for case-insensitive duplicate names', () => {
    const config: MCPConfig = {
      mcpServers: {
        MyServer: { command: 'npx' },
        myserver: { command: 'npx' },
      },
    };

    const diagnostics = duplicateNamesRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('duplicate-names');
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('should pass when names are unique', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: { command: 'npx' },
        server2: { command: 'npx' },
      },
    };

    const diagnostics = duplicateNamesRule.check(config);
    expect(diagnostics).toHaveLength(0);
  });
});
