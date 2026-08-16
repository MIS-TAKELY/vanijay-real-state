import depthLimit from 'graphql-depth-limit';
import {
  GraphQLError,
  Kind,
  visit,
  type ASTVisitor,
  type ValidationContext,
  type ValidationRule,
} from 'graphql';

/** Maximum selection-set nesting permitted in a single GraphQL operation. */
export const MAX_GRAPHQL_DEPTH = 10;

/**
 * Maximum computed query complexity permitted in a single GraphQL operation.
 *
 * The public list queries (featured / similar / recently-viewed / recently-
 * added) inline every card field (~53 fields). Fragment-based queries
 * (propertiesFeed, property) are under-counted here because fragment spreads
 * aren't expanded by the naive field counter, so 100 leaves comfortable
 * headroom for legitimate first-party queries while still blocking abusive
 * inline queries.
 */
export const MAX_GRAPHQL_COMPLEXITY = 100;

/**
 * Field-count complexity validation rule.
 *
 * We deliberately do NOT use `graphql-query-complexity`'s `createComplexityRule`
 * here: its internal `QueryComplexity` calls `getVariableValues()` (with the
 * *validation context's* variable values) so it can estimate cost — but during
 * validation Apollo hasn't populated those variables yet. As a result it rejects
 * **any** operation that declares a non-null variable:
 *
 *   `property($idOrSlug: ID!)`                → “Expected a value of non-null
 *                                                type ID! to be provided.”
 *   `createProperty($input: CreatePropertyInput!)` → same error.
 *
 * That broke every GraphQL read/mutation that takes a required argument.
 * Because this app estimates cost with `simpleEstimator` (1 point per field,
 * independent of variable values), we replicate that exact behavior with a
 * plain field counter and sidestep the variable-coercion bug entirely.
 */
function createSafeComplexityRule(maxComplexity: number): ValidationRule {
  return (context: ValidationContext): ASTVisitor => ({
    OperationDefinition(node) {
      let complexity = 0;
      visit(node, {
        [Kind.FIELD]() {
          complexity += 1;
        },
      });
      if (complexity > maxComplexity) {
        context.reportError(
          new GraphQLError(
            `Query is too complex. Maximum complexity is ${maxComplexity}.`,
            { nodes: node },
          ),
        );
      }
    },
  });
}

/**
 * Validation rules wired into Apollo Server through `@nestjs/apollo`'s
 * `validationRules` option (Apollo Server 5 still supports it).
 */
export const graphqlValidationRules: ValidationRule[] = [
  depthLimit(MAX_GRAPHQL_DEPTH),
  createSafeComplexityRule(MAX_GRAPHQL_COMPLEXITY),
];
