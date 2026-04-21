# Contributing

Want to contribute to MCP Config Guard? Great! 🚀

## Development Environment Setup

```bash
git clone <repo-url>
cd mcp-config-guard
pnpm install
pnpm build
pnpm test
```

## Adding a New Rule

Follow these steps to add a new rule to MCP Config Guard:

### Step 1: Create Rule File

Create a new file under `packages/core/src/rules/`:

```typescript
import type { Diagnostic, MCPConfig, Rule } from '../types.js';

export const myNewRule: Rule = {
  id: 'my-new-rule',
  description: 'Rule description goes here',
  severity: 'warning', // 'error' | 'warning' | 'info'

  check(config: MCPConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { mcpServers } = config;

    // Rule logic here
    for (const [name, server] of Object.entries(mcpServers)) {
      // ...
    }

    return diagnostics;
  },

  // fix() method is optional. Only add if auto-fix is possible.
  fix?(config: MCPConfig): MCPConfig {
    // Fix logic
    return newConfig;
  },
};
```

### Step 2: Register the Rule

`packages/core/src/rules/index.ts`:

```typescript
import { myNewRule } from './my-new-rule.js';

export const rules: Rule[] = [
  // ... existing rules
  myNewRule,
];
```

### Step 3: Write Tests

`packages/core/src/tests/rules/my-new-rule.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { myNewRule } from '../../rules/my-new-rule.js';
import type { MCPConfig } from '../../types.js';

describe('my-new-rule', () => {
  it('should detect the issue', () => {
    const config: MCPConfig = {
      mcpServers: {
        server1: { command: 'npx' },
      },
    };

    const diagnostics = myNewRule.check(config);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].ruleId).toBe('my-new-rule');
  });
});
```

### Step 4: Write Tests

Tests should be written in `packages/core/src/tests/rules/` using inline configs. See existing tests for examples.

### Step 5: Write Documentation

Create `docs/rules/my-new-rule.md` and describe the rule.

### Step 6: Build and Test

```bash
pnpm build
pnpm test
```

## PR Rules

Before opening a PR:

- [ ] `pnpm build` must succeed
- [ ] `pnpm test` all tests must pass
- [ ] `pnpm typecheck` must not error
- [ ] Tests must be written for new rules
- [ ] Documentation must be updated

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `test:` — adding/updating tests
- `refactor:` — code refactoring

Example: `feat: add port-conflict rule`
