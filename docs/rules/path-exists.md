# path-exists

## Description

Checks whether file or directory paths specified in `args` actually exist on the filesystem. Only absolute paths are checked (starting with `/`, `~/`, `C:\`).

## Example

```json
{
  "mcpServers": {
    "server1": {
      "command": "npx",
      "args": ["/Users/user/projects", "/nonexistent/path"]
    }
  }
}
```

If `/nonexistent/path` does not exist, this rule raises a warning.

## Relative Paths

Relative paths (`./server.js`, `../data`) are not checked. Their validity depends on the directory where the config file is executed, making validation complex.

## Auto Fix

✗ No — If the path does not exist, you must either correct the path or create the file.
