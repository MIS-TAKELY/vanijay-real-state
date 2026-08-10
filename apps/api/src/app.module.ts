import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { graphqlValidationRules } from './common/graphql/graphql-validation';

import './common/graphql/register-enums';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PropertiesModule } from './modules/rest/properties/properties.module';
import { AuthModule } from './modules/rest/auth/auth.module';
import { SellerModule } from './modules/rest/seller/seller.module';
import { UploadsModule } from './modules/rest/uploads/uploads.module';
import { FavoritesModule } from './modules/rest/favorites/favorites.module';
import { CartModule } from './modules/rest/cart/cart.module';
import { AnalyticsModule } from './modules/rest/analytics/analytics.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        base: { service: 'vanijay-real-state-api' },
      },
    }),

    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100, setHeaders: false }],
    }),
    CommonModule,
    PrismaModule,
    HealthModule,
    CloudinaryModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: process.env.NODE_ENV !== 'production',
      path: '/api/v1/vanijay-real-state',
      validationRules: graphqlValidationRules,
    }),
    AuthModule,
    PropertiesModule,
    SellerModule,
    UploadsModule,
    FavoritesModule,
    CartModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
