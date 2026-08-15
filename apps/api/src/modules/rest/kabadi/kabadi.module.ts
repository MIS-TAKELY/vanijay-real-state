import { Module } from '@nestjs/common';
import { KabadiController } from './kabadi.controller';
import { KabadiService } from './kabadi.service';

@Module({
  controllers: [KabadiController],
  providers: [KabadiService],
  exports: [KabadiService],
})
export class KabadiModule {}
