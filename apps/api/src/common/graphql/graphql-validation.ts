import depthLimit from 'graphql-depth-limit';
import { createComplexityRule, simpleEstimator } from 'graphql-query-complexity';
import { GraphQLError, type ValidationRule } from 'graphql';

/** Maximum selection-set nesting permitted in a single GraphQL operation. */
export const MAX_GRAPHQL_DEPTH = 10;

/** Maximum computed query complexity permitted in a single GraphQL operation. */
export const MAX_GRAPHQL_COMPLEXITY = 50;

/**
 * Validation rules wired into Apollo Server through `@nestjs/apollo`'s
 * `validationRules` option (Apollo Server 5 still supports it).
 *
 * Both libraries ship CommonJS entry points, so they load fine from the
 * project's CJS-compiled `dist/main.js`:
 *  - `depthLimit`         → rejects operations nested deeper than
 *    `MAX_GRAPHQL_DEPTH`.
 *  - `createComplexityRule` → rejects operations whose computed complexity
 *    (1 point per field via `simpleEstimator`) exceeds `MAX_GRAPHQL_COMPLEXITY`.
 *
 * `createComplexityRule` returns `(context) => QueryComplexity`; graphql uses
 * the returned instance as an AST visitor during validation, so we cast it to
 * `ValidationRule` (its declared return type isn't a graphql `ASTVisitor`).
 */
export const graphqlValidationRules: ValidationRule[] = [
  depthLimit(MAX_GRAPHQL_DEPTH),
  createComplexityRule({
    maximumComplexity: MAX_GRAPHQL_COMPLEXITY,
    createError: () =>
      new GraphQLError(
        `Query is too complex. Maximum complexity is ${MAX_GRAPHQL_COMPLEXITY}.`,
      ),
    estimators: [simpleEstimator({ defaultComplexity: 1 })],
  }) as unknown as ValidationRule,
];
