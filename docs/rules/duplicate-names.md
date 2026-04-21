# duplicate-names

## Description

Checks for case-insensitive duplicate server names in the `mcpServers` object. For example, `MyServer` and `myserver` would conflict.

## Invalid Usage

```json
{
  "mcpServers": {
    "MyServer": {
      "command": "npx"
    },
    "myserver": {
      "command": "npx"
    }
  }
}
```

## Valid Usage

```json
{
  "mcpServers": {
    "MyServer": {
      "command": "npx"
    },
    "OtherServer": {
      "command": "node"
    }
  }
}
```

## Auto Fix

✗ No — Rename the servers to have unique names.
