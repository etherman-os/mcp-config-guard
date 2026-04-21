---
name: New Rule Suggestion
about: Suggest a new rule
title: ''
labels: enhancement
assignees: ''
---

## Rule Name

E.g.: `no-empty-env`

## Severity

- [ ] ERROR
- [ ] WARNING
- [ ] INFO

## Description

What should the rule do?

## Example Invalid Config

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

## Example Valid Config

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx",
      "env": {
        "PATH": "/usr/bin"
      }
    }
  }
}
```

## Is Auto-Fix Possible?

- [ ] Yes (will have a fix() method)
- [ ] No (detection only)

## Additional Information

<!-- Add any additional information here -->
