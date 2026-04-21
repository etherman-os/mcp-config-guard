# port-conflict

## Description

Raises an error if two different MCP servers use the same port.

## Invalid Usage

```json
{
  "mcpServers": {
    "api": {
      "command": "node",
      "env": { "PORT": "3000" }
    },
    "web": {
      "command": "node",
      "env": { "PORT": "3000" }
    }
  }
}
```

## Solution

Ensure each server uses a different port:

```json
{
  "mcpServers": {
    "api": {
      "command": "node",
      "env": { "PORT": "3000" }
    },
    "web": {
      "command": "node",
      "env": { "PORT": "3001" }
    }
  }
}
```

## Checked Environment Variables

`PORT`, `SERVER_PORT`, `APP_PORT`, `MCP_PORT`

## Auto Fix

✗ No — Port conflicts are serious configuration errors and must be resolved manually.
