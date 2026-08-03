import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from '@repo/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { getRequest } from 'src/common/get-request';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = getRequest(context);
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) throw new UnauthorizedException();
    req.user = session.user;        // attach user to request
    req.session = session.session;
    return true;
  }
}
