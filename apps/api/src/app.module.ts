import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { graphqlValidationRules } from './common/graphql/graphql-validation';
// Side-effect import: registers Prisma enums as GraphQL enum types before the
// schema is generated.
import './common/graphql/register-enums';
import { AuthModule } from './modules/rest/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PropertiesModule } from './modules/properties/properties.module';

@Module({
  imports: [
    // Structured JSON logging (stdout) for both app logs and HTTP requests.
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        base: { service: 'vanijay-real-state-api' },
      },
    }),
        // Global in-memory throttler; the guard itself lives in CommonModule
    // (GqlThrottlerGuard via APP_GUARD) so it covers REST + GraphQL.
    // `setHeaders: false` is required for the GraphQL transport: Apollo Server
    // (via @nestjs/apollo) owns response headers, and the GraphQL execution
    // context does not expose an express `res` — the base guard would call
    // `res.header(...)` and throw. Rate-limit headers are still set on REST
    // responses where an express `res` is available.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100, setHeaders: false }],
    }),
    CommonModule,
    PrismaModule,
    HealthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: process.env.NODE_ENV !== 'production',
      path: '/api/v1/vanijay-real-state',
      validationRules: graphqlValidationRules,
    }),
    AuthModule,
    PropertiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
