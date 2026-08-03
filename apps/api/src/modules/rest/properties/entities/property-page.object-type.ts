import { createCursorPageObjectType } from 'src/common/pagination';
import { Property } from './property.entity';

/**
 * GraphQL object type for the cursor-paginated property feed:
 * `{ items: [Property], nextCursor: String|null, hasMore: Boolean }`.
 * Backed by `PropertiesService.findFeed()` (keyset pagination).
 */
export const PropertyPage = createCursorPageObjectType('Property', Property);
