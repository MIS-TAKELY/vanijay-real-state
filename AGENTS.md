# Workspace Agent Rules

## Tool Call Requirements for AI Agents (OpenCode, MimoCode, Kimi Code, XKiro)

1. **Verify Code Before Editing**:
   - Always `read` the file before making changes.
   - Confirm that the requested change is actually needed. If the import or type is ALREADY present (e.g. `DocumentType` in `register-enums.ts`), do NOT issue an `edit` tool call.

2. **Strict Tool Call Formatting (`edit`)**:
   - Every `edit` tool call MUST include all 3 required properties: `filePath`, `oldString`, and `newString`.
   - Never omit `newString`. If replacing text with nothing, pass `newString: ""` (empty string).
   - Use camelCase keys (`filePath`, `oldString`, `newString`). Never use snake_case (`file_path`, `old_string`, `new_string`).

