# command-exists

## Description

Checks whether the command executable exists on the system. Uses `which` on Linux/macOS and `where` on Windows to verify the command is in PATH.

## Invalid Usage

```json
{
  "mcpServers": {
    "server1": {
      "command": "uvx"
    }
  }
}
```

If `uvx` is not installed or not in PATH, this rule raises a warning.

## Valid Usage

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx"
    }
  }
}
```

Or use the full path:

```json
{
  "mcpServers": {
    "server1": {
      "command": "/usr/local/bin/uvx"
    }
  }
}
```

## Auto Fix

✗ No — Either install the command, add it to PATH, or provide the full path to the executable.
