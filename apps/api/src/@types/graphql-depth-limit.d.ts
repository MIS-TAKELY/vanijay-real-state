/**
 * Minimal ambient typings for `graphql-depth-limit`, which ships no type
 * declarations (`"files": ["index.js"]`). It is a CommonJS module whose default
 * export is a function returning a graphql `ValidationRule`.
 */
declare module 'graphql-depth-limit' {
  import type { ValidationRule } from 'graphql';

  export default function depthLimit(maxDepth: number): ValidationRule;
}
