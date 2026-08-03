import { BadRequestException } from '@nestjs/common';

export const PAGINATION_DEFAULTS = {
  defaultTake: 20,
  maxTake: 100,
} as const;

export interface Cursor {
  createdAt: string; // ISO 8601
  id: string;
}

export interface CursorPaginationOptions {
  first?: number;
  after?: string; // opaque encoded cursor
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null; // null on the last page
  hasMore: boolean;
}

export function resolveFirst(first?: number): number {
  const requested = first ?? PAGINATION_DEFAULTS.defaultTake;
  return Math.min(
    Math.max(1, Math.trunc(requested)),
    PAGINATION_DEFAULTS.maxTake,
  );
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCursor(raw?: string | null): Cursor | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.id === 'string' &&
      typeof parsed.createdAt === 'string'
    ) {
      // re-serialise the date so malformed ISO strings blow up here, not in Prisma
      return {
        id: parsed.id,
        createdAt: new Date(parsed.createdAt).toISOString(),
      };
    }
    throw new Error('cursor missing id/createdAt');
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}
