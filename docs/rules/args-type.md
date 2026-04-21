# args-type

## Description

This rule triggers when the `args` field is provided as a string instead of an array. In the MCP protocol, `args` must always be an array of strings.

## Invalid Usage

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx",
      "args": "-y server-name"
    }
  }
}
```

## Valid Usage

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx",
      "args": ["-y", "server-name"]
    }
  }
}
```

## Auto Fix

✓ Yes — `mcp-guard fix` automatically fixes this error.
