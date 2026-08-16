import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function getRequest(context: ExecutionContext) {
  switch (context.getType<'http' | 'graphql'>()) {
    case 'http':
      return context.switchToHttp().getRequest();

    case 'graphql':
      return GqlExecutionContext.create(context).getContext().req;

    default:
      throw new Error(`Unsupported context: ${context.getType()}`);
  }
}
