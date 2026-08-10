import { Module } from '@nestjs/common';
import { PropertiesModule } from '../properties/properties.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [PropertiesModule, AnalyticsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
