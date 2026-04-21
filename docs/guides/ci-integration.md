# CI Integration

How to integrate `mcp-guard` into your CI/CD pipeline.

## GitHub Actions

Add this step to your workflow:

```yaml
- name: Validate MCP config
  run: npx -p mcp-config-guard mcp-guard validate --format json --strict
```

### Full Example

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-mcp-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - name: Validate MCP config
        run: npx -p mcp-config-guard mcp-guard validate --format json --strict
```

## Exit Codes

- `0` — No errors found
- `1` — Errors found (or warnings with `--strict`)

The CI job will fail if `mcp-guard` returns exit code 1, preventing merges when there are MCP config issues.

## JSON Output

Use `--format json` for machine-readable output:

```json
[
  {
    "ruleId": "command-split",
    "severity": "error",
    "message": "Shell command provided as a single string. command and args must be separated.",
    "path": "mcpServers.filesystem.command",
    "suggestion": "command: \"npx\", args: [\"-y\",\"@modelcontextprotocol/server-filesystem\",\"/tmp\"]"
  }
]
```
