# Claude Code

Guide for configuring MCP servers in Claude Code.

## Config File Location

- **Global:** `~/.claude/mcp.json`
- **Project-level:** `<project>/.mcp.json` (in your project root)

Note: The project-level file is `.mcp.json` (hidden file with a leading dot, placed in the project root directory).

## Common Issues

### Command and Args Separation

The same common mistake applies in Claude Code: the `command` field should contain only the executable, with arguments in the `args` array.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    }
  }
}
```

### Missing PATH in Environment

Some MCP servers (especially those using `npx`) may fail if the `PATH` environment variable is not set. Consider adding it:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

## Validate Your Config

```bash
mcp-guard validate .mcp.json
```
