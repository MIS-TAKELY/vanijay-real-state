import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  controllers: [SellerController],
  providers: [SellerService],
  imports: [PropertiesModule],
})
export class SellerModule {}
