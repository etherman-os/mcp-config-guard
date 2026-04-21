# Claude Desktop

Guide for configuring MCP servers in Claude Desktop.

## Config File Location

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

## Example Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

## Common Issues

### Shell Command as Single String

The most common mistake is putting the entire command in the `command` field:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx -y @modelcontextprotocol/server-filesystem /tmp"
    }
  }
}
```

This **will not work**. Use `mcp-guard validate` to detect this and similar issues.

## Validate Your Config

```bash
mcp-guard validate ~/Library/Application\ Support/Claude/claude_desktop_config.json
```
