# Workspace Agent Rules

## ⛔ CRITICAL: Tool Call Rules — Read Before Every Tool Invocation

These rules are MANDATORY. Violating them will cause tool execution to fail. Follow them on every single tool call without exception.

---

### Rule 1 — `edit` Tool: ALL 3 Arguments Are REQUIRED, Always

The `edit` tool signature is:

```
edit(filePath, oldString, newString)
```

You MUST provide ALL THREE arguments, every time, no exceptions:

| Argument    | Required | Notes                                                            |
| ----------- | -------- | ---------------------------------------------------------------- |
| `filePath`  | ✅ YES   | Absolute path to the file                                        |
| `oldString` | ✅ YES   | The EXACT text currently in the file                             |
| `newString` | ✅ YES   | The replacement text. Use `""` to delete. NEVER omit this field. |

❌ **WRONG** (missing `newString` — will fail):

```json
{ "filePath": "/path/to/file.tsx", "oldString": "some code" }
```

✅ **CORRECT** (all 3 present):

```json
{
  "filePath": "/path/to/file.tsx",
  "oldString": "some code",
  "newString": "new code"
}
```

---

### Rule 2 — Use camelCase Keys, Never snake_case

- ✅ `filePath`, `oldString`, `newString`
- ❌ `file_path`, `old_string`, `new_string`

---

### Rule 3 — Read Before You Edit

Always call `read` on the file BEFORE calling `edit`. Confirm the `oldString` is present verbatim. If it is not found exactly, the edit will silently fail or match the wrong location.

---

### Rule 4 — No Delegation When Failing

If a tool call fails, DO NOT:

- Delegate to a subagent
- Repeat the same malformed call
- Use XML-style arguments (`<new_string>...</new_string>`)

Instead: fix the argument format and retry directly using the correct JSON structure.

---

### Rule 5 — Do Not Split a Single Edit Across Multiple Tool Calls

Use ONE `edit` call per contiguous block of changes. Re-read the file before making a second edit to the same file.

---

### Rule 6 — `Agent` Tool: `description` Is REQUIRED

When calling the `Agent` tool to spawn a subagent, the `description` field is required:

```json
{ "description": "...", "prompt": "..." }
```

Never omit `description`.

---

### Rule 7 — Verify Code Before Editing

Before editing, always `read` the file and confirm:

1. The target code actually exists as `oldString`
2. The change is not already applied (don't double-apply)
