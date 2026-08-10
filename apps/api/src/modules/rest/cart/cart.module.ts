import { Module } from '@nestjs/common';
import { PropertiesModule } from '../properties/properties.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [PropertiesModule, AnalyticsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
