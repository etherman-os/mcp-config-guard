# MCP Config Guard

Catches and fixes silent errors in MCP config files.

## The Problem

When configuring MCP (Model Context Protocol) config files, people make the most common mistake:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx -y @modelcontextprotocol/server-filesystem /tmp"
    }
  }
}
```

This **DOES NOT WORK** — but no error is given. The application fails silently and users spend hours trying to figure out "why it's not working".

## The Solution

`mcp-guard` finds this error in 0.2 seconds:

```
$ mcp-guard validate ./claude_desktop_config.json
✗ ERROR [mcpServers.filesystem.command]
   Shell command provided as a single string. command and args must be separated.
   Fix: command: "npx", args: ["-y","@modelcontextprotocol/server-filesystem","/tmp"]
ℹ INFO [mcpServers.filesystem.env]
   env field is empty. PATH is not defined; npx may not be found on some systems.
⚠ WARNING [mcpServers.filesystem.command]
   Command not found: npx -y @modelcontextprotocol/server-filesystem /tmp. It must be in PATH.

✗ 1 error, 1 warning, 1 info
```

## Installation

```bash
npm install -g mcp-config-guard
```

Or use with `npx`:

```bash
npx -p mcp-config-guard mcp-guard validate ./config.json
```

## Usage

### Validate

```bash
mcp-guard validate [file]
```

Validates a config file. If no file is specified, finds the default path.

```bash
mcp-guard validate ./claude_desktop_config.json
mcp-guard validate --format json ./config.json  # JSON output for CI
mcp-guard validate --strict ./config.json         # Treat warnings as errors
```

### Fix

Fixes auto-fixable errors automatically:

```bash
mcp-guard fix ./config.json
mcp-guard fix ./config.json --dry-run  # Show changes but do not write to file
```

### List Rules

Lists all available rules:

```bash
mcp-guard list-rules
```

### Exit Codes

- `0` — No errors
- `1` — Errors or warnings found (with `--strict`)

## Rules

| Rule | Severity | Description | Auto Fix |
|------|----------|-------------|----------|
| `command-split` | ERROR | Shell command provided as a single string | ✓ Yes |
| `args-type` | ERROR | args provided as string, must be an array | ✓ Yes |
| `required-fields` | ERROR | command field is missing or empty | ✗ No |
| `path-exists` | WARNING | Specified file path does not exist | ✗ No |
| `env-path` | INFO | env is empty or PATH is not defined | ✗ No |
| `port-conflict` | ERROR | Same port used by multiple servers | ✗ No |
| `duplicate-names` | WARNING | Server names conflict (case-insensitive) | ✗ No |
| `command-exists` | WARNING | Command not found on system | ✗ No |

## CI Integration

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

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
        run: npx mcp-config-guard validate --format json --strict
```

## VS Code Extension

MCP Config Guard also works inside VS Code. When you open a config file:

- Errors are underlined in red
- Hover shows an explanation
- "Fix" button provides automatic fixing
- Status bar in the bottom right corner (✔/✗/⚠)

**Installation:** Search for "MCP Config Guard" on the VS Code Marketplace.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

## License

MIT
