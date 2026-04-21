# Cursor

Guide for configuring MCP servers in Cursor editor.

## Config File Location

- **macOS/Linux:** `~/.cursor/mcp.json` (or `~/Library/Application Support/Cursor/mcp.json` on some macOS installations)
- **Windows:** `%APPDATA%\Cursor\mcp.json`
- **Project-level:** `<project>/.cursor/mcp.json`

## Common Issues

### Command and Args Separation

The same common mistake applies in Cursor: the `command` field should contain only the executable, with arguments in the `args` array.

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

## Validate Your Config

```bash
mcp-guard validate ~/.cursor/mcp.json
```
