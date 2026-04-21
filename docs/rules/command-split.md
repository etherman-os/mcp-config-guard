# command-split

## Description

This rule triggers when a space is detected in the `command` field. The user likely pasted a shell command as a single string instead of separating the executable from its arguments.

## Invalid Usage

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx -y @modelcontextprotocol/server-filesystem /tmp"
    }
  }
}
```

## Valid Usage

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

## Auto Fix

✓ Yes — `mcp-guard fix` automatically fixes this error.

## Details

In the MCP protocol, `command` takes only the executable; arguments are specified separately in the `args` array. When this distinction is not made, the application fails silently.
