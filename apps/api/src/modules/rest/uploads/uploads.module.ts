import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

/**
 * Reusable upload feature. Registers the REST endpoints and exposes both
 * `UploadsService` and the multer helpers (`createMulterOptions`, mime
 * constants) so other modules can accept file uploads with the same rules.
 */
@Module({
  imports: [CloudinaryModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
