import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesResolver } from './properties.resolver';
import { PropertiesService } from './properties.service';
import { SitemapNotifyService } from './sitemap-notify.service';

/**
 * One module declaring BOTH transports (REST controller + GraphQL resolver)
 * backed by ONE `PropertiesService`. `PrismaClient` is `@Global()` so it's
 * injectable here without importing `PrismaModule`.
 *
 * The service is exported so other modules (e.g. an inquiries module) can reuse
 * the domain logic.
 */
@Module({
  controllers: [PropertiesController],
  providers: [PropertiesResolver, PropertiesService, SitemapNotifyService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
