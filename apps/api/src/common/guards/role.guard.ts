import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@repo/db';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { getRequest } from 'src/common/get-request';
import { normalizeUserRoles } from 'src/common/utils/role.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = getRequest(context);
    const userRoles = normalizeUserRoles(request.user);

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
