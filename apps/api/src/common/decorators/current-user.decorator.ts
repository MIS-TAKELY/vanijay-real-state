// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { getRequest } from '../get-request';
// export const CurrentUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = getRequest(ctx);
//     return data ? request.user?.[data] : request.user;
//   },
// );



import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from '../get-request';
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return data ? request.user?.[data] : request.user;
  },
);