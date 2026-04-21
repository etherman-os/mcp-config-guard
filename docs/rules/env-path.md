# env-path

## Description

Displays an info message if the `env` object is empty or the `PATH`/`Path` variable is not defined. On some systems, the `npx` command may not be found.

## Example

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx",
      "env": {}
    }
  }
}
```

## Solution

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx",
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

## Auto Fix

✗ No — You must manually set environment variables according to your system.
