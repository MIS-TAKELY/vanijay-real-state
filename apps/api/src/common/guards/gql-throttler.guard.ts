import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getRequest } from '../get-request';

export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    return {
      req: getRequest(context),
      res: context.switchToHttp().getResponse(),
    };
  }
}
