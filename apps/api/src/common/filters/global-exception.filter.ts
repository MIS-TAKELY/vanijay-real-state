import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Global catch-all exception filter.
 *
 * Goals:
 *  - Log every unhandled error exactly once (with stack trace when available).
 *  - Return a single, consistent JSON error shape for REST endpoints.
 *  - Stay out of the way for GraphQL: rethrow so Apollo/Nest format the error
 *    into the GraphQL `errors[]` array uniformly.
 *
 * Registered application-wide via `APP_FILTER` in `CommonModule`, so it covers
 * both REST controllers and GraphQL resolvers (it uses `host.getType()` to tell
 * them apart).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.error(
      exception instanceof Error
        ? exception.stack ?? exception.message
        : String(exception),
    );

    // GraphQL: let Apollo package the (re)thrown error into errors[].
    if (host.getType<'http' | 'graphql'>() === 'graphql') {
      throw exception instanceof Error ? exception : new Error(String(exception));
    }

    // REST: respond with a consistent JSON payload.
    const response = host.switchToHttp().getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // class-validator's BadRequestException nests the messages under `message`
    // (e.g. { message: ['field must be a string'], error, statusCode }) —
    // surface that array directly to clients.
    if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      message = (message as { message: unknown }).message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
