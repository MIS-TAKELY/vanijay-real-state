import { UserRole } from '@repo/db';

type RolesUser = {
  role?: UserRole | UserRole[] | string | string[] | null;
  roles?: UserRole[] | string[] | null;
};

/**
 * Normalize a user's roles into a stable UserRole[] regardless of the shape
 * Better Auth returns them in. Supports:
 * - user.roles (array)
 * - user.role as an array
 * - user.role as a single string (legacy data)
 */
export function normalizeUserRoles(user: RolesUser | null | undefined): UserRole[] {
  if (!user) return [];

  const raw = user.roles ?? user.role;
  if (Array.isArray(raw)) return raw as UserRole[];
  if (typeof raw === 'string' && raw) return [raw as UserRole];
  return [];
}

export function hasRole(
  userRoles: UserRole[],
  ...requiredRoles: UserRole[]
): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasAllRoles(
  userRoles: UserRole[],
  ...requiredRoles: UserRole[]
): boolean {
  return requiredRoles.every((role) => userRoles.includes(role));
}
