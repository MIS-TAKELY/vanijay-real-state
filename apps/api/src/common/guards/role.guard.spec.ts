import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './role.guard';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';

/**
 * `RolesGuard` only calls getType(), getHandler(), getClass() on the context
 * and (via `getRequest`) switchToHttp().getRequest(). Guards are pure logic
 * here, so a minimal HTTP context stub is enough — no Nest testing module,
 * no Better Auth stack, no reflect-metadata polyfill required.
 */
function createMockContext(user: unknown): ExecutionContext {
  const request = { user };
  return {
    getType: () => 'http',
    getHandler: () => jest.fn(),
    getClass: () => class Target {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

/** A Reflector whose getAllAndOverride returns a fixed roles list. */
function mockReflector(requiredRoles: string[] | undefined): Reflector {
  return {
    getAllAndOverride: jest.fn(() => requiredRoles),
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows when no @Roles metadata is present', () => {
    const guard = new RolesGuard(mockReflector(undefined));
    expect(guard.canActivate(createMockContext({ roles: ['BUYER'] }))).toBe(
      true,
    );
  });

  it('reads the required roles via the ROLES_KEY metadata', () => {
    const reflector = mockReflector(['ADMIN']);
    const guard = new RolesGuard(reflector);
    guard.canActivate(createMockContext({ roles: ['ADMIN'] }));
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      expect.any(Function),
      expect.any(Function),
    ]);
  });

  it('allows when the user holds at least one required role (array form)', () => {
    const guard = new RolesGuard(mockReflector(['SELLER', 'ADMIN']));
    expect(guard.canActivate(createMockContext({ roles: ['SELLER'] }))).toBe(
      true,
    );
  });

  it('denies when the user holds none of the required roles', () => {
    const guard = new RolesGuard(mockReflector(['ADMIN']));
    expect(guard.canActivate(createMockContext({ roles: ['BUYER'] }))).toBe(
      false,
    );
  });

  it('normalizes a legacy single-string user.role into an array', () => {
    const guard = new RolesGuard(mockReflector(['ADMIN']));
    expect(guard.canActivate(createMockContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('denies when there is no user on the request', () => {
    const guard = new RolesGuard(mockReflector(['ADMIN']));
    expect(guard.canActivate(createMockContext(null))).toBe(false);
  });
});
