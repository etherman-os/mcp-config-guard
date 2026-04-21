# required-fields

## Description

Every MCP server must have a `command` field. This rule triggers when the field is missing or empty.

## Invalid Usage

```json
{
  "mcpServers": {
    "server1": {
      "args": ["some-arg"]
    }
  }
}
```

or:

```json
{
  "mcpServers": {
    "server1": {
      "command": ""
    }
  }
}
```

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

## Auto Fix

✗ No — This error must be fixed manually.
